#!/usr/bin/env python3
"""Render a fact-bound CAESTHETIC social-case package. No network or publishing.

Dependencies: Python 3.11+, reportlab, fonttools, PyMuPDF, Pillow; ffmpeg on PATH.
Input: content.json plus article-en.md beside it; --assets directory containing
the exact logo, canonical tokens.css, OFL font sources and their licence files.
Run: python build_pack.py --content content.json --assets assets --output output
"""
import argparse, hashlib, json, re, shutil, subprocess
from pathlib import Path
from xml.sax.saxutils import escape

import fitz
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont as FontToolsFont
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether, Table, TableStyle, Flowable


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


class ActionLink(Flowable):
    """A real PDF link; the same component becomes an anchor in the future blog."""
    def __init__(self,label,url,color):
        super().__init__();self.label,self.url,self.color=label,url,color;self.width=484;self.height=48
    def draw(self):
        c=self.canv;c.setFillColor(self.color);c.rect(0,0,self.width,self.height,fill=1,stroke=0)
        c.setFillColor(HexColor('#F5F7F8'));c.setFont('PlexMedium',13)
        c.drawString(18,18,self.label)
        c.linkURL(self.url,(0,0,self.width,self.height),relative=1,thickness=0)


class Renderer:
    def __init__(self, content, assets, output):
        self.content_path = Path(content).resolve()
        self.data = json.loads(self.content_path.read_text())
        if set(self.data.get('languages', {})) != {'en'}:
            raise ValueError('Publication packages must contain English only; keep review translations outside the package')
        if re.search(r'[\u0400-\u04ff]', json.dumps(self.data, ensure_ascii=False)):
            raise ValueError('Cyrillic text found in the English publication payload')
        self.alias = self.data['case_alias']
        if not re.fullmatch(r'CN-[0-9]{3,}', self.alias):
            raise ValueError('Use an independent public case alias')
        for period in ('before','after'):
            e=self.data['evidence'][period]; n=e['qualified_enquiries']
            if n<=0: raise ValueError('Qualified inquiry denominator must be positive')
            for numerator,rate in [('scheduled_consultations','consultation_rate_rounded_percent'),('recorded_first_human_reply_within_2h','reply_rate_rounded_percent')]:
                if not 0<=e[numerator]<=n or abs(100*e[numerator]/n-e[rate])>.51:
                    raise ValueError(f'Inconsistent measurement: {period}/{rate}')
        self.assets, self.out = Path(assets).resolve(), Path(output).resolve()
        self.out.mkdir(parents=True, exist_ok=True)
        self.temp = self.out / '_build'
        self.temp.mkdir(exist_ok=True)
        self.layout_checks = []
        raw = (self.assets / 'tokens.css').read_text()
        self.colors = {k: v for k, v in re.findall(r'--cae-([\w-]+):\s*(#[A-Fa-f0-9]{6})', raw)}
        required = {'bg':'#F5F7F8','text':'#14191C','accent':'#1C3A4A','signal':'#7B244B'}
        for k, v in required.items():
            if self.colors.get(k, '').upper() != v:
                raise ValueError(f'Unexpected canonical token {k}; review design source before rendering')
        for name, file, loc in [('Plex','IBMPlexSans-variable.ttf',{'wght':400,'wdth':100}),
                                ('PlexMedium','IBMPlexSans-variable.ttf',{'wght':600,'wdth':100}),
                                ('Serif','SourceSerif4-variable.ttf',{'wght':400,'opsz':48})]:
            target = self.temp / f'{name}.ttf'
            f = FontToolsFont(self.assets / file, recalcTimestamp=False)
            instantiateVariableFont(f, loc, inplace=True).save(target)
            pdfmetrics.registerFont(TTFont(name, str(target)))
        pdfmetrics.registerFontFamily('Plex',normal='Plex',bold='PlexMedium',italic='Plex',boldItalic='PlexMedium')

    def color(self, key):
        return HexColor(self.colors[key])

    def fill(self, key):
        self.c.setFillColor(self.color(key))

    def line(self, y, x=72, end=1008, color='border', width=2):
        self.c.setStrokeColor(self.color(color));self.c.setLineWidth(width)
        self.c.line(x,self.h-y,end,self.h-y)

    def text(self, text, x, top, width, size=42, font='Plex', color='text', leading=None, max_bottom=None):
        text = str(text or '')
        leading = leading or size*1.2
        lines=[]
        for p in text.split('\n'):
            buf=''
            for word in p.split():
                candidate=(buf+' '+word).strip()
                if pdfmetrics.stringWidth(candidate,font,size)>width and buf:
                    lines.append(buf);buf=word
                else:buf=candidate
            lines.append(buf)
        end=top+len(lines)*leading
        if max_bottom is not None and end>max_bottom:
            raise ValueError(f'Overflow: {self.page_key}: {text[:45]} end={end} limit={max_bottom}')
        self.fill(color);self.c.setFont(font,size)
        for i,l in enumerate(lines):
            measured=pdfmetrics.stringWidth(l,font,size)
            if measured>width+1:raise ValueError(f'Unbreakable text exceeds width: {l}')
            self.c.drawString(x,self.h-top-size*.81-i*leading,l)
        self.layout_checks.append({'page':self.page_key,'top':round(top,1),'bottom':round(end,1),'text':text,'size':size})
        return end

    def start(self, c, height, locale, page, total=8, dark=False):
        self.c,self.h,self.locale=c,height,locale
        self.page_key=f'{locale}/{height}/{page}'
        self.dark=dark
        self.fill('bg-dark' if dark else 'bg');c.rect(0,0,1080,height,fill=1,stroke=0)
        self.top_offset=120 if height==1920 else 0
        self.bottom_offset=240 if height==1920 else 0
        y=72+self.top_offset
        c.drawImage(str(self.assets/'logo-square.png'),72,height-y-64,64,64,preserveAspectRatio=True,mask='auto')
        self.text('CAESTHETIC',156,y+4,660,28,'PlexMedium','bg' if dark else 'accent')
        self.text('CASE NOTES',156,y+40,660,24,'Plex','bg' if dark else 'muted')
        self.line(y+96,color='muted' if dark else 'border')
        fy=height-88-self.bottom_offset
        self.line(fy-24,color='muted' if dark else 'border')
        self.text(self.alias,72,fy,260,28,'PlexMedium','bg' if dark else 'accent')
        if total:
            self.text(f'{page:02d} / {total:02d}',870,fy,138,28,'Plex','bg' if dark else 'muted')
            for i in range(total):
                self.fill('signal' if i==page-1 else ('muted' if dark else 'border'))
                c.rect(586+i*29,height-fy-22,20,4,fill=1,stroke=0)
        self.body_bottom=fy-72

    def heading(self, s, size=74):
        y=210+self.top_offset
        if s.get('kicker'):
            self.text(s['kicker'],72,y,936,28,'PlexMedium','bg' if self.dark else 'signal');y+=60
        y=self.text(s['title'],72,y,914,size,'Serif','bg' if self.dark else 'text-strong',size*1.07,max_bottom=self.body_bottom)
        return y+56

    def draw_rows(self,rows,y,kind='normal'):
        for i,row in enumerate(rows):
            self.line(y)
            self.text(f'{i+1:02d}',72,y+30,70,30,'PlexMedium','signal')
            label=row.get('label','');value=row.get('value','')
            if label:
                y2=self.text(label,176,y+25,808,38,'PlexMedium',max_bottom=self.body_bottom)
                if value:y2=self.text(value,176,y2+12,808,40,max_bottom=self.body_bottom)
            else:y2=self.text(value,176,y+28,808,44,max_bottom=self.body_bottom)
            y=max(y+128,y2+36)
        return y

    def slide(self,c,s,height,locale):
        typ=s['type'];dark=(typ=='cta')
        self.start(c,height,locale,s['number'],dark=dark)
        off=self.top_offset
        if typ=='cover':
            y=self.heading(s,90)
            if s.get('body'):y=self.text(s['body'],72,y,840,42,max_bottom=self.body_bottom)+44
            self.line(y+24)
            self.text(self.data['visuals']['cover_before_count'],72,y+70,280,184,'Serif','accent')
            self.text('→',410,y+94,180,106,'Plex','signal')
            self.text(self.data['visuals']['cover_after_count'],704,y+70,270,184,'Serif','accent')
        elif typ=='result':
            y=self.heading(s,72)
            b=self.data['evidence']['before'];a=self.data['evidence']['after']
            self.text(f"{b['consultation_rate_rounded_percent']}%",72,y+20,420,150,'Serif','accent')
            self.text('→',474,y+44,105,80,'Plex','signal')
            self.text(f"{a['consultation_rate_rounded_percent']}%",616,y+20,392,150,'Serif','accent')
            y+=212
            y=self.text(s['body'],72,y,936,42,'PlexMedium',max_bottom=self.body_bottom)+34
            self.line(y);y+=30
            note=s.get('metric_note') or 'Jan–Apr → May–Aug 2025. Rounded rates.'
            y=self.text(note,72,y,936,38,'Plex','muted',max_bottom=self.body_bottom)+22
            caveat='Before/after comparison; several changes.'
            self.text(caveat,72,y,936,36,'Plex','muted',max_bottom=self.body_bottom)
        elif typ=='cta':
            y=self.heading(s,86)
            if s.get('body'):y=self.text(s['body'],72,y,900,44,'Plex','bg',max_bottom=self.body_bottom)+66
            self.c.setStrokeColor(self.color('bg'));self.c.setLineWidth(2)
            by=min(max(y+32,870+off),self.body_bottom-130)
            self.c.rect(72,self.h-by-108,936,108,stroke=1,fill=0)
            self.text(self.data['primary_destination_url'].replace('https://','').rstrip('/'),100,by+32,855,38,'PlexMedium','bg')
            self.c.linkURL(self.data['primary_destination_url'],(72,self.h-by-108,1008,self.h-by),relative=0,thickness=0)
        else:
            y=self.heading(s)
            if s.get('visual',{}).get('type')=='reply_rate':
                value=self.data['evidence']['after'][s['visual']['field']]
                y=self.text(f'{value}%',72,y,936,150,'Serif','accent',max_bottom=self.body_bottom)+22
            if s.get('body'):
                y=self.text(s['body'],72,y,900,44,max_bottom=self.body_bottom)+48
            if s.get('rows'):y=self.draw_rows(s['rows'],y)
            vis=s.get('visual',{})
            if vis.get('type') in ('handoff','sequence'):
                y=max(y+38,690+off)
                items=vis['items']; step=936/len(items)
                self.line(y+114,color='border-data',width=3)
                for i,item in enumerate(items):
                    x=72+i*step
                    self.fill('signal' if vis['type']=='handoff' and i==len(items)-1 else 'accent')
                    self.c.circle(x+12,self.h-y-114,9,stroke=0,fill=1)
                    self.text(item,x,y+158,step-30,36,'PlexMedium',max_bottom=self.body_bottom)
                self.text('→',960,y+62,48,48,'Plex','accent')
            if s.get('metric_note'):
                self.text(s['metric_note'],72,y+12,936,38,'Plex','muted',max_bottom=self.body_bottom)
        c.showPage()

    def render_pdf(self,path,slides,height,locale):
        c=canvas.Canvas(str(path),pagesize=(1080,height),pageCompression=1,invariant=1)
        c.setTitle(f'CAESTHETIC Case Notes | {self.alias} | {locale.upper()}')
        c.setAuthor('CAESTHETIC');c.setSubject('An anonymized case on the public inquiry path')
        for s in slides:self.slide(c,s,height,locale)
        c.save()

    def raster(self,pdf,directory):
        directory.mkdir(parents=True,exist_ok=True)
        with fitz.open(pdf) as d:
            for i,p in enumerate(d):p.get_pixmap(alpha=False).save(directory/f'{i+1:02d}.png')

    def short_card(self,lang,locale):
        path=self.temp/f'short-{locale}.pdf'
        c=canvas.Canvas(str(path),pagesize=(1080,1350),pageCompression=1,invariant=1)
        c.setTitle(f'{self.alias} | One inquiry owner | {locale}')
        self.start(c,1350,locale,1,total=0)
        info=lang['short_post']['image']
        y=self.heading({'kicker':'ONE DECISION','title':info['title']},92)
        y=self.text(info['subtitle'],72,y,900,46,max_bottom=1010)+62
        labels=info['sequence_labels']
        for i,l in enumerate(labels):
            self.line(y)
            self.text(f'{i+1:02d}',72,y+24,90,32,'PlexMedium','signal')
            self.text(l,182,y+22,810,42,'PlexMedium')
            y+=112
        c.showPage();c.save()
        with fitz.open(path) as d:d[0].get_pixmap(alpha=False).save(self.out/f'{self.alias}-short-{locale}.png')

    def article(self,lang,locale):
        path=self.out/f'{self.alias}-article-{locale}.pdf'
        doc=SimpleDocTemplate(str(path),pagesize=(612,792),rightMargin=64,leftMargin=64,topMargin=74,bottomMargin=64,
                              title=lang['article']['title'],author='CAESTHETIC',pageCompression=1)
        styles={
            'body':ParagraphStyle('body',fontName='Plex',fontSize=11.5,leading=17,spaceAfter=10,allowWidows=0,allowOrphans=0,textColor=self.color('text')),
            'title':ParagraphStyle('title',fontName='Serif',fontSize=30,leading=32,spaceAfter=18,textColor=self.color('text-strong')),
            'lead':ParagraphStyle('lead',fontName='Plex',fontSize=13,leading=18.5,spaceAfter=18,textColor=self.color('muted')),
            'h2':ParagraphStyle('h2',fontName='Serif',fontSize=20,leading=24,spaceBefore=14,spaceAfter=10,keepWithNext=True,textColor=self.color('accent')),
            'meta':ParagraphStyle('meta',fontName='PlexMedium',fontSize=9.5,leading=14,spaceAfter=14,textColor=self.color('signal')),
        }
        source=self.content_path.parent/f'article-{locale}.md'
        text=source.read_text()
        if re.search(r'[\u0400-\u04ff]', text):
            raise ValueError('Cyrillic text found in the English article')
        self.out.joinpath(f'{self.alias}-article-{locale}.md').write_text(text)
        story=[Paragraph(f'CAESTHETIC CASE NOTES · {self.alias}',styles['meta']),Paragraph(escape(lang['article']['title']),styles['title']),Paragraph(escape(lang['article']['subtitle']),styles['lead']),HRFlowable(width='100%',thickness=1,color=self.color('border')),Spacer(1,18)]
        # This preview keeps all manuscript paragraphs, source notes and real links.
        cleaned=re.sub(r'^---\n.*?\n---\n','',text,flags=re.S)
        for block in re.split(r'\n\s*\n',cleaned.strip()):
            if block.startswith('# '):continue
            if block.strip().strip('*')==lang['article']['subtitle']:continue
            action=re.fullmatch(r'\[([^\]]+)\]\((https?://[^\)]+)\)',block.strip())
            if action and action[2]==self.data['primary_destination_url']:
                previous=story.pop() if story and isinstance(story[-1],Paragraph) else Spacer(1,0)
                story.extend([KeepTogether([previous,Spacer(1,8),ActionLink(action[1],action[2],self.color('text'))]),Spacer(1,18)]);continue
            if block.startswith('|'):
                records=[r.strip().strip('|').split('|') for r in block.splitlines() if r.strip() and not re.fullmatch(r'[\s|:\-]+',r)]
                cells=[[Paragraph(escape(cell.strip()),styles['body']) for cell in row] for row in records]
                table=Table(cells,colWidths=[125,263,96],repeatRows=1,hAlign='LEFT')
                table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEABOVE',(0,0),(-1,0),1,self.color('text')),
                   ('LINEBELOW',(0,0),(-1,0),1,self.color('border')),('LINEBELOW',(0,1),(-1,-1),.5,self.color('border')),
                   ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
                story.extend([table,Spacer(1,12)]);continue
            style=styles['body']
            if block.startswith('## '):style=styles['h2'];block=block[3:]
            elif block.startswith('### '):style=styles['h2'];block=block[4:]
            t=escape(block).replace('\n','<br/>')
            t=re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',t)
            t=re.sub(r'\[([^\]]+)\]\((https?://[^\)]+)\)',r'<link href="\2" color="#1C3A4A"><u>\1</u></link>',t)
            story.append(Paragraph(t,style))
        def page(c,d):
            c.saveState();c.setFillColor(self.color('bg'));c.rect(0,0,612,792,fill=1,stroke=0)
            c.setFont('Plex',8.5);c.setFillColor(self.color('muted'))
            c.drawString(64,757,'CAESTHETIC / CASE NOTES')
            c.drawRightString(548,35,f'{self.alias} · {locale.upper()} · {d.page}')
            c.restoreState()
        doc.build(story,onFirstPage=page,onLaterPages=page)

    def video(self,locale,durations):
        frames=self.temp/f'vertical-{locale}'
        concat=self.temp/f'concat-{locale}.txt'
        lines=[]
        for i,duration in enumerate(durations,1):
            lines += [f"file '{(frames/f'{i:02d}.png').as_posix()}'",f'duration {duration}']
        lines.append(f"file '{(frames/f'{len(durations):02d}.png').as_posix()}'")
        concat.write_text('\n'.join(lines)+'\n')
        target=self.out/f'{self.alias}-video-{locale}.mp4'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),
                        '-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=48000','-t',str(sum(durations)),
                        '-vf','fps=30,format=yuv420p','-c:v','libx264','-preset','fast','-crf','21',
                        '-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)

    def run(self,no_video=False):
        durations=self.data['video']['slide_durations_seconds']
        assert len(durations)==8 and 30<=sum(durations)<=45
        caption_counts={}
        for locale,lang in self.data['languages'].items():
            assert len(lang['slides'])==8
            self.render_pdf(self.out/f'{self.alias}-carousel-{locale}.pdf',lang['slides'],1350,locale)
            self.raster(self.out/f'{self.alias}-carousel-{locale}.pdf',self.out/f'carousel-{locale}')
            self.render_pdf(self.temp/f'vertical-{locale}.pdf',lang['slides'],1920,locale)
            self.raster(self.temp/f'vertical-{locale}.pdf',self.temp/f'vertical-{locale}')
            self.short_card(lang,locale);self.article(lang,locale)
            captions=[]
            for kind in ['carousel','short_post']:
                for channel,body in lang[kind]['captions'].items():
                    limit={'instagram':2200,'linkedin':3000,'facebook':2200}[channel]
                    assert len(body)<=limit,(locale,kind,channel,len(body))
                    caption_counts[f'{locale}.{kind}.{channel}']=len(body)
                    captions += [f'# {kind} / {channel}',body,'','## First comment (optional alternative; do not publish together with the caption link)' ,lang[kind]['first_comment'][channel],'']
            (self.out/f'{self.alias}-captions-{locale}.md').write_text('\n\n'.join(captions))
            narration='SCRIPT ONLY: no voiceover is included in the MP4.\n\n'+'\n'.join(s['speaker_notes'] for s in lang['slides'])+'\n'
            (self.out/f'{self.alias}-narration-script-{locale}.txt').write_text(narration)
            if not no_video:self.video(locale,durations)
        (self.out/'content.json').write_text(self.content_path.read_text())
        readme=self.content_path.parent/'README_EN.md'
        if readme.exists():shutil.copyfile(readme,self.out/'README_EN.md')
        sheets=[]
        for locale in self.data['languages']:
            sheet=Image.new('RGB',(1440,900),self.colors['bg'])
            for i in range(8):
                im=Image.open(self.out/f'carousel-{locale}'/f'{i+1:02d}.png').resize((360,450),Image.Resampling.LANCZOS)
                sheet.paste(im,((i%4)*360,(i//4)*450))
            sheet.save(self.out/f'{self.alias}-overview-{locale}.png');sheets.append(str(self.out/f'{self.alias}-overview-{locale}.png'))
        checks={'status':'pass','slide_count_per_language':8,'locales':list(self.data['languages']),'duration_seconds':sum(durations),
                'caption_character_counts':caption_counts,'layout_blocks_checked':len(self.layout_checks),'sources':{p.name:sha(p) for p in self.assets.iterdir() if p.is_file()},
                'notes':['No publishing or scheduler calls.','Audio is intentionally silent AAC; no voice or music has been generated.','Article source links are public product routes; no client identifier or geographic slug is exported.']}
        (self.out/'build-checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
        (self.temp/'layout-checks.json').write_text(json.dumps(self.layout_checks,ensure_ascii=False,indent=2))
        print(json.dumps(checks,ensure_ascii=False,indent=2))


if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--content',required=True);a.add_argument('--assets',required=True);a.add_argument('--output',required=True);a.add_argument('--no-video',action='store_true')
    args=a.parse_args();Renderer(args.content,args.assets,args.output).run(args.no_video)
