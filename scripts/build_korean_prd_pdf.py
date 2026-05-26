from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, ListFlowable, ListItem, HRFlowable

ROOT = Path('/Users/goyunseo/.hermes/workspaces/personal-memory-ai-rpi')
md_path = ROOT / 'docs/product/personal-memory-ai-korean-prd-2026-05-26.md'
pdf_path = ROOT / 'artifacts/personal-memory-ai-korean-prd-2026-05-26.pdf'
font_path = Path('/System/Library/Fonts/Supplemental/AppleGothic.ttf')
font_name = 'AppleGothic'
pdfmetrics.registerFont(TTFont(font_name, str(font_path)))

styles = getSampleStyleSheet()
base = ParagraphStyle('KoreanBase', parent=styles['BodyText'], fontName=font_name, fontSize=10.2, leading=15, spaceAfter=6, alignment=TA_LEFT)
h1 = ParagraphStyle('KoreanH1', parent=base, fontSize=20, leading=26, spaceBefore=10, spaceAfter=10, textColor=colors.HexColor('#111111'))
h2 = ParagraphStyle('KoreanH2', parent=base, fontSize=15, leading=21, spaceBefore=12, spaceAfter=8, textColor=colors.HexColor('#1f2937'))
h3 = ParagraphStyle('KoreanH3', parent=base, fontSize=12.5, leading=18, spaceBefore=8, spaceAfter=6, textColor=colors.HexColor('#374151'))
quote = ParagraphStyle('KoreanQuote', parent=base, leftIndent=8*mm, borderColor=colors.HexColor('#d1d5db'), borderWidth=1, borderPadding=6, backColor=colors.HexColor('#f9fafb'))
code = ParagraphStyle('KoreanCode', parent=base, fontName=font_name, fontSize=9, leading=13, leftIndent=5*mm, backColor=colors.HexColor('#f3f4f6'), borderPadding=4)
small = ParagraphStyle('KoreanSmall', parent=base, fontSize=8.5, leading=12, textColor=colors.HexColor('#6b7280'))

story = []

def esc(s):
    return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def add_para(text, style=base):
    if text.strip():
        story.append(Paragraph(esc(text), style))

lines = md_path.read_text(encoding='utf-8').splitlines()
in_code = False
code_buf = []
list_buf = []

def flush_list():
    global list_buf
    if list_buf:
        story.append(ListFlowable([ListItem(Paragraph(esc(x), base), leftIndent=4*mm) for x in list_buf], bulletType='bullet', leftIndent=6*mm))
        list_buf = []

def flush_code():
    global code_buf
    if code_buf:
        story.append(Paragraph('<br/>'.join(esc(x) for x in code_buf), code))
        story.append(Spacer(1, 3*mm))
        code_buf = []

for raw in lines:
    line = raw.rstrip()
    if line.startswith('```'):
        if in_code:
            flush_code(); in_code=False
        else:
            flush_list(); in_code=True; code_buf=[]
        continue
    if in_code:
        code_buf.append(line)
        continue
    if not line.strip():
        flush_list(); story.append(Spacer(1, 2*mm)); continue
    if line.strip() == '---':
        flush_list(); story.append(HRFlowable(width='100%', thickness=0.6, color=colors.HexColor('#e5e7eb'), spaceBefore=4, spaceAfter=8)); continue
    if line.startswith('# '):
        flush_list(); story.append(Paragraph(esc(line[2:]), h1)); continue
    if line.startswith('## '):
        flush_list(); story.append(Paragraph(esc(line[3:]), h2)); continue
    if line.startswith('### '):
        flush_list(); story.append(Paragraph(esc(line[4:]), h3)); continue
    if line.startswith('- '):
        list_buf.append(line[2:]); continue
    if line.startswith('> '):
        flush_list(); story.append(Paragraph(esc(line[2:]), quote)); continue
    add_para(line, base)
flush_list(); flush_code()

pdf_path.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(pdf_path), pagesize=A4, rightMargin=17*mm, leftMargin=17*mm, topMargin=16*mm, bottomMargin=16*mm)

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(font_name, 8)
    canvas.setFillColor(colors.HexColor('#6b7280'))
    canvas.drawString(17*mm, 10*mm, 'Personal Memory AI 한글 기획서 · 2026-05-26')
    canvas.drawRightString(A4[0]-17*mm, 10*mm, str(doc.page))
    canvas.restoreState()

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(pdf_path)
