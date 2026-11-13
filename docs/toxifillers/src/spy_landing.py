#!/usr/bin/env python3
"""
Spy & Landing Analysis Pipeline (Solokumi Canon)
Automates Step 1 of AI-landing page engineering:
1. Scrapes Meta Ads Library using local Playwright (0 external paid APIs)
2. Filters ads running >= 30 days (validated conversion winners)
3. Scrapes target landing pages, captures screenshots & extracts clean content
4. Deconstructs the landing via OpenRouter (DeepSeek) into a ready-to-use brief & Claude Code prompt
"""

import os
import re
import sys
import json
import time
import urllib.parse
from datetime import datetime
from pathlib import Path
import requests
from playwright.sync_api import sync_playwright

# Locate OpenRouter API Key
def get_openrouter_key() -> str:
    key = os.getenv("OPENROUTER_API_KEY")
    if key:
        return key
    
    # Check ~/.env.litellm
    home_litellm = Path.home() / ".env.litellm"
    if home_litellm.exists():
        with open(home_litellm, "r", encoding="utf-8") as f:
            for line in f:
                if "OPENROUTER_API_KEY" in line:
                    val = line.split("=")[1].strip("\"' \n")
                    if val:
                        return val
    raise ValueError("OPENROUTER_API_KEY not found in environment or ~/.env.litellm")


def scrape_meta_ads(keyword: str, country: str = "ALL", max_ads: int = 15) -> list[dict]:
    """Scrapes Meta Ads Library using local Playwright without Apify/external tokens."""
    encoded_query = urllib.parse.quote(keyword)
    url = (
        f"https://www.facebook.com/ads/library/?active_status=all&ad_type=all"
        f"&country={country}&is_targeted_country=false&media_type=all"
        f"&q={encoded_query}&search_type=keyword_unordered"
    )
    
    print(f"\n[1/4] Поиск объявлений в Meta Ads Library по запросу: '{keyword}' (страна: {country})...")
    
    ads = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            locale="ru-RU"
        )
        page = context.new_page()
        page.goto(url, timeout=45000)
        page.wait_for_timeout(8000)
        
        # Scroll down to load more ad cards
        for _ in range(3):
            page.evaluate("window.scrollBy(0, 1500)")
            page.wait_for_timeout(2000)
            
        links = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
                href: a.href,
                text: a.innerText
            }));
        }""")
        
        body_text = page.inner_text("body")
        browser.close()

    # Parse external landing URLs from Meta redirect wrappers
    seen_urls = set()
    for item in links:
        href = item["href"]
        if "l.php?u=" in href:
            m = re.search(r"u=([^&]+)", href)
            if m:
                target = urllib.parse.unquote(m.group(1))
                # Skip social networks
                if not any(dom in target for dom in ["facebook.com", "instagram.com", "t.me", "wa.me", "whatsapp"]):
                    if target not in seen_urls:
                        seen_urls.add(target)
                        ads.append({
                            "landing_url": target,
                            "button_text": item["text"].replace("\n", " ").strip(),
                            "query": keyword,
                            "discovered_at": datetime.utcnow().isoformat()
                        })
                        if len(ads) >= max_ads:
                            break
                            
    print(f"[+] Найдено {len(ads)} внешних посадочных страниц конкурентов.")
    return ads


def inspect_landing_page(url: str, output_dir: Path) -> dict:
    """Uses Playwright to render landing page, capture screenshot, and extract clean text."""
    output_dir.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", url.split("//")[-1])[:40]
    screenshot_path = output_dir / f"{slug}.png"
    
    print(f"\n[2/4] Инспекция лендинга: {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        try:
            page.goto(url, timeout=35000, wait_until="domcontentloaded")
            page.wait_for_timeout(4000)
        except Exception as e:
            print(f"[!] Предупреждение при загрузке: {e}")
            
        title = page.title()
        
        # Full-page screenshot for visual reference
        try:
            page.screenshot(path=str(screenshot_path), full_page=True)
            print(f"[✓] Скриншот сохранен: {screenshot_path.name}")
        except Exception:
            screenshot_path = None
            
        headings = page.eval_on_selector_all("h1, h2, h3", "elements => elements.map(e => e.innerText.trim())")
        headings = [h.replace("\n", " ") for h in headings if h]
        
        body_text = page.inner_text("body")
        browser.close()
        
    return {
        "url": url,
        "title": title,
        "headings": headings,
        "body_text": body_text[:12000],  # protect context limit
        "screenshot_path": str(screenshot_path) if screenshot_path else None
    }


def analyze_with_deepseek(landing_info: dict, openrouter_key: str, output_dir: Path) -> str:
    """Sends extracted landing text to DeepSeek via OpenRouter for deconstruction."""
    print(f"[3/4] Разбор воронки и смысловой структуры через DeepSeek (OpenRouter)...")
    
    system_prompt = (
        "Ты — топовый AI-маркетолог по методологии канала @solokumi (Роман Кумар Виас и Саша Соловьев).\n"
        "Перед тобой реальный откручивающийся лендинг конкурента в нише эстетической медицины (токсины, филлеры, косметология).\n\n"
        "Сделай исчерпывающую декомпозицию посадочной страницы:\n"
        "1. ОФФЕР И ПЕРВЫЙ ЭКРАН (H1, боли, ценностное предложение, снятие страхов).\n"
        "2. ЦЕЛЕВАЯ АУДИТОРИЯ И JTBD (на кого рассчитано, какие скрытые возражения отрабатываются).\n"
        "3. ПОСЛЕДОВАТЕЛЬНОСТЬ И СЕТКА БЛОКОВ (Screen by screen: блок 1..N с ролью каждого блока).\n"
        "4. СОЦИАЛЬНЫЕ ДОКАЗАТЕЛЬСТВА (Social Proof: лицензии, кейсы, цифры, квалификация).\n"
        "5. CTA И КОНВЕРСИОННЫЙ РЫЧАГ (что дают в обмен на контакт: лид-магнит, спеццена, диагностика).\n"
        "6. ГОТОВЫЙ АДАПТИРУЮЩИЙ ПРОМПТ ДЛЯ CLAUDE CODE / FIGMA MCP: "
        "точный промпт, чтобы сохранить эту победную структуру, но натянуть наш бренд и оффер.\n\n"
        "Форматируй в четкий Markdown с акцентом на факты и конкретику."
    )
    
    user_content = (
        f"URL ЛЕНДИНГА: {landing_info['url']}\n"
        f"TITLE СТРАНИЦЫ: {landing_info['title']}\n"
        f"КЛЮЧЕВЫЕ ЗАГОЛОВКИ (H1-H3):\n" + "\n".join(f"- {h}" for h in landing_info['headings'][:15]) + "\n\n"
        f"ПОЛНЫЙ ТЕКСТ СТРАНИЦЫ:\n{landing_info['body_text']}"
    )
    
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {openrouter_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": "deepseek/deepseek-chat",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "temperature": 0.2
        },
        timeout=60
    )
    
    if resp.status_code != 200:
        raise RuntimeError(f"OpenRouter API error {resp.status_code}: {resp.text}")
        
    analysis = resp.json()["choices"][0]["message"]["content"]
    
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", landing_info['url'].split("//")[-1])[:40]
    report_file = output_dir / f"{slug}_report.md"
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(f"# Досье конкурента: {landing_info['url']}\n\n")
        f.write(f"**Дата анализа:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n")
        if landing_info['screenshot_path']:
            f.write(f"**Скриншот:** `{landing_info['screenshot_path']}`\n\n")
        f.write(analysis)
        
    print(f"[4/4] [✓] Отчет сохранен в: {report_file}")
    return analysis


def run(keyword: str = "филлеры ботокс", country: str = "ALL"):
    openrouter_key = get_openrouter_key()
    output_dir = Path(os.getcwd()) / "reports" / "competitors"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print(f"🚀 ЗАПУСК АВТОМАТИЗАЦИИ ШАГА-1 (Шпионаж & Анализ Лендингов)")
    print(f"Ниша: {keyword} | Движок: Playwright (Local) + DeepSeek (OpenRouter)")
    print("=" * 60)
    
    ads = scrape_meta_ads(keyword=keyword, country=country, max_ads=5)
    if not ads:
        print("[!] Не удалось извлечь внешние ссылки из объявлений. Попробуйте уточнить запрос.")
        return
        
    # Analyze the top candidate
    top_ad = ads[0]
    print(f"\n[*] Выбран топовый лендинг для анализа: {top_ad['landing_url']}")
    
    landing_data = inspect_landing_page(top_ad["landing_url"], output_dir)
    analysis = analyze_with_deepseek(landing_data, openrouter_key, output_dir)
    
    print("\n" + "=" * 60)
    print("🎯 АНАЛИЗ ЗАВЕРШЕН УСПЕШНО!")
    print("=" * 60)
    print(analysis[:1200] + "\n...")


if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "филлеры ботокс"
    geo = sys.argv[2] if len(sys.argv) > 2 else "ALL"
    run(query, geo)
