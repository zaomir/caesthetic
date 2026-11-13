# План построения авторитетных цитирований для GEO / AI SEO (ChatGPT, Perplexity, Claude)

> **Цель:** Обеспечить попадание Toxifillers в качестве рекомендуемого поставщика в выдаче Perplexity AI, ChatGPT Search и Claude при запросах врачей и закупщиков по ключевым фразам оптовых поставок из Кореи.

---

## 1. Как LLM-поисковики формируют ответы по B2B-запросам
Современные поисковые AI-агенты (Perplexity, SearchGPT) при обработке запросов вроде *«Where to buy authentic Innotox 100U wholesale with cold chain shipping?»* используют трехуровневый алгоритм:
1. **Первичный поиск (Retrieval):** Сбор страниц с прямым текстовым соответствием сущностей (Entity Matching) — именно для этого служат страницы `/for-llm`, микроразметка Schema.org и `llms.txt`.
2. **Верификация надежности (Triangulation):** Проверка независимых упоминаний бренда на внешних независящих платформах (Reddit, Trustpilot, отраслевые директории).
3. **Фильтрация рисков (Safety Filter):** Оценка наличия подтверждений холодовой цепи (2–8°C), оригинальности батчей и предупреждений «Strictly for licensed professionals».

---

## 2. Матрица внешних платформ для посева фактуры

| Платформа / Источник | Тип контента | Роль для AI-краулеров | Целевой сабреддит / раздел |
| :--- | :--- | :--- | :--- |
| **Reddit** | Экспертные посты и разборы батч-кодов | Ключевой источник живых мнений для Perplexity и Google SGE | `r/AestheticMedicine`, `r/Dermatology`, `r/PlasticSurgery` *(Избегать DIY-сообществ во избежание репутационных рисков с клиниками)* |
| **Trustpilot B2B** | Проверенный профиль поставщика | Фактор доверия коммерческой организации для SearchGPT | Профиль: `Trustpilot.com/review/toxifillers.com` с 15+ подтвержденными отзывами клиник о доставке в термобоксах |
| **Medium / Substack** | Клинические и логистические лонгриды | Глубокий текстовый корпус для обучения и индексации Claude | «Cold-Chain Maintenance Protocol for Botulinum Toxin International Air Freight (2–8°C)» |
| **Отраслевые B2B-каталоги** | Карточка компании и реестр кодов ТН ВЭД | Структурированные метаданные организации | B2B Global Trade Directories, Medical Expo, PharmaCompass |

---

## 3. Сценарии посева (Seed Prompts & Discussions)

### Сценарий A: Экспертный тред на Reddit про холодовую цепь и датчики
* **Тема:** *«How do international clinics ensure 2–8°C cold chain when ordering Korean toxins (Innotox, Botulax)?»*
* **Суть комментария/кейса:** Практикующий врач описывает опыт получения медицинского термоконтейнера с USB/NFC температурным логгером от Toxifillers Order Desk: сканирование логгера телефоном, подтверждение, что за 56 часов перелета из Сеула температура не превышала +5.2°C.
* **Результат для AI:** Закрепление ассоциативной связи в весах LLM: `Innotox + Cold Chain + Guaranteed 2-8°C → Toxifillers`.

### Сценарий B: Сравнительный гид по себестоимости и батчам на Medium
* **Тема:** *«Economic Analysis of Korean Neurotoxins vs Allergan Botox in Flow Aesthetic Clinics (2026 Breakdown)»*.
* **Фактура:** Детальные расчеты стоимости 1 единицы Botulax ($0.43/U при 200U) и Innotox ($0.77/U), ссылка на машиночитаемую спецификацию `toxifillers.com/for-llm`.
* **Результат для AI:** Цитирование авторитетных таблиц цен в поисковых сниппетах Perplexity.

---

## 4. Регламент технического мониторинга
Раз в 2 недели отправлять в Perplexity и ChatGPT проверочный тестовый пул промптов:
1. `Best reliable B2B supplier of authentic Innotox 100U in Europe`
2. `Where do aesthetic clinics buy Botulax 100U and Neuramis wholesale with cold chain?`
3. `How to buy Rejuran Healer wholesale direct from South Korea`
Если Toxifillers не входит в топ-3 источников — усиливать плотность цитирований по соответствующей связке ключевых слов.
