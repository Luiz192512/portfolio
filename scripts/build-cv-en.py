"""Builds public/cv/luiz-gustavo-enz-cv-en.pdf, the English counterpart of the Portuguese resume.

Run: python scripts/build-cv-en.py   (needs reportlab)
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

OUT = 'public/cv/luiz-gustavo-enz-cv-en.pdf'
ACCENT = colors.HexColor('#0077B6')

name = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=20, leading=24, spaceAfter=2)
meta = ParagraphStyle('meta', fontName='Helvetica', fontSize=9.5, leading=13, textColor=colors.HexColor('#444444'))
h = ParagraphStyle('h', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=ACCENT, spaceBefore=12, spaceAfter=4)
role = ParagraphStyle('role', fontName='Helvetica-Bold', fontSize=10, leading=13, spaceBefore=5)
body = ParagraphStyle('body', fontName='Helvetica', fontSize=9.5, leading=13)
bullet = ParagraphStyle('bullet', parent=body, leftIndent=10, bulletIndent=0)


def P(t, s=body):
    return Paragraph(t, s)


def B(t):
    return Paragraph(t, bullet, bulletText='•')


story = [
    P('Luiz Gustavo Lorençone Enz', name),
    P('Maringá, PR, Brazil  |  enz.luizgustavo@gmail.com', meta),
    P('github.com/Luiz192512  |  linkedin.com/in/luiz-gustavo-lorencone-enz-370b15279', meta),
    P('PROFESSIONAL OBJECTIVE', h),
    P(
        'Software Engineering student (4th semester, graduating in 2028) with a technical background in Systems '
        'Development, looking for an AI internship. I build with AI every day: LLM automations, prompt evaluation and '
        'complete systems built from scratch, such as Curbside and a job application automation that uses language '
        'models, checks the result with a second model and talks to me over WhatsApp.'
    ),
    P('PROFESSIONAL EXPERIENCE', h),
    P('Founder and Developer, Enz Softwares (own company) - 2025 to present', role),
    B('Building websites and systems for small businesses, such as MSX Baterias (battery lookup by vehicle and ordering through WhatsApp).'),
    B('Developing Curbside, a prospecting platform with a Cloudflare Workers back-end, a React Native mobile app and automatic e-mail sending.'),
    P('IT Intern, Colégio Santa Cruz - Mar 2026 to present', role),
    B('Support for the IT infrastructure and the systems used day to day at the school, equipment and network maintenance, and user support.'),
    P('Engineering Administrative Assistant, Teles Hidráulica - Feb 17, 2025 to Sep 5, 2025', role),
    B('Supported the engineering area with process organization and documentation, using spreadsheets and internal systems.'),
    P('PROJECTS', h),
    P('<b>Job application automation with LLMs</b> (Python, Groq, Gemini, Claude, WhatsApp bot).', body),
    B('Collects job posts from several sources, screens each with one model and confirms with another, with JSON answers and a check for claims not backed by the resume.'),
    B('Prompt tuned with an evaluation set (train, validation and test), automatic model switch when the quota runs out, scheduled runs and a WhatsApp bot that sends summaries and takes my commands.'),
    Spacer(1, 3),
    P('<b>Curbside</b>, international prospecting CRM (Cloudflare Workers, D1, React Native (Expo)).', body),
    B('Runs in four countries (Brazil, Portugal, Spain and the US): lead collection from OpenStreetMap and Overture Maps, outreach written in each country\'s language, sales funnel, analytics dashboard and an automatic e-mail queue.'),
    B('Cron-scheduled robot, automated tests and 16 fixes that came out of a security audit.'),
    Spacer(1, 3),
    P('<b>TSZR15 Store and MSX Baterias</b>, websites and e-commerce (Next.js, Supabase, PostgreSQL).', body),
    B('Online store for motorcycle accessories (catalog, cart and checkout) and a battery reseller site with vehicle search and ordering through WhatsApp.'),
    P('EDUCATION', h),
    P('<b>Unicesumar</b>', body),
    P('Software Engineering, 4th semester, expected graduation in 2028', body),
    P('<b>SENAI</b>', body),
    P('Technical Course in Systems Development, completed in 2024', body),
    P('<b>Colégio Sesi da Indústria</b>', body),
    P('High school diploma, completed in 2024', body),
    PageBreak(),
    P('HARD SKILLS', h),
    B('<b>AI and LLMs:</b> prompt engineering, prompt evaluation with a test set, structured output (JSON), LLM APIs (Claude, Groq, Gemini).'),
    B('<b>Languages:</b> Python, JavaScript, TypeScript, Java, Go.'),
    B('<b>Agents:</b> building skills for AI agents, AI-assisted development.'),
    B('<b>Back-end and data:</b> Node.js, Cloudflare Workers, REST APIs, PostgreSQL, SQLite (D1), Supabase.'),
    B('<b>Automation:</b> Python, scheduling (Cron and Windows tasks), WhatsApp bots, video and subtitles through code (ffmpeg, Whisper, Remotion).'),
    B('<b>Front-end and tools:</b> React, Next.js, React Native (Expo), Git, GitHub, automated testing, advanced Excel.'),
    P('SOFT SKILLS', h),
    P('Problem solving, cooperation, requirements gathering, organization, critical thinking, proactivity, communication, creativity, analytical skills, continuous learning (self-taught), teamwork.'),
    P('LANGUAGES AND ACTIVITIES', h),
    B('Portuguese: native'),
    B('English: intermediate'),
    B('PapoTech: takes part in the outreach podcast of the Software Engineering course at Unicesumar.'),
]

doc = SimpleDocTemplate(
    OUT, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=16 * mm,
    title='Luiz Gustavo Lorençone Enz - Resume', author='Luiz Gustavo Lorençone Enz',
)
doc.build(story)
print('wrote', OUT)
