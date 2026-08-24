import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top Cyan Accent Line
        self.setStrokeColor(colors.HexColor('#00f0ff'))
        self.setLineWidth(3)
        self.line(36, 762, 576, 762)

        # Footer text
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#64748b'))
        self.drawString(36, 20, "CONFIDENTIAL // PROJECT SUBMISSION SUMMARY")
        self.drawRightString(576, 20, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    pdf_filename = "/Users/yash/.gemini/antigravity/scratch/home-soc-lab/Project_Summary_Home_SOC_Lab.pdf"
    
    # 0.5 inch margins (36pt) on Letter size (612 x 792 pt)
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0284c7')
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )

    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1e293b')
    )

    table_header = ParagraphStyle(
        'THeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1e293b')
    )

    story = []

    # Title Banner
    story.append(Paragraph("Home SOC Lab & A.E.G.I.S. Cyber Ops Platform", title_style))
    story.append(Paragraph("Production-Grade SIEM, Multi-Cloud Detection Engineering & AI Command Center", subtitle_style))
    story.append(Spacer(1, 4))
    
    # Metadata Header Lines (Including Author, Reg No, Roll No, GitHub Repo & Live Deployment Link)
    meta_text = (
        "<b>Student Name:</b> Yash Panjwani &nbsp;|&nbsp; <b>Reg No:</b> 12305425 &nbsp;|&nbsp; <b>Roll No:</b> 38<br/>"
        "<b>Live Deployment:</b> https://yashh127.github.io/home-soc-lab-aegis-cyber-ops/ &nbsp;|&nbsp; <b>GitHub Repo:</b> https://github.com/yashh127/home-soc-lab-aegis-cyber-ops"
    )
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=6))

    # Executive Overview
    story.append(Paragraph("EXECUTIVE OVERVIEW", section_heading))
    overview_text = (
        "The <b>Home SOC Lab & A.E.G.I.S. Cyber Ops Platform</b> is an end-to-end, enterprise-grade Security Operations Center (SOC) "
        "infrastructure built to simulate real-world SIEM telemetry monitoring, detection engineering, and automated incident response. "
        "The environment ingests live and replayed security events from Active Directory Domain Controllers, Linux systems, and AWS Cloud "
        "(CloudTrail & GuardDuty), applying 20 custom correlation rules aligned directly with the MITRE ATT&amp;CK framework."
    )
    story.append(Paragraph(overview_text, body_style))
    story.append(Spacer(1, 6))

    # Core Architectural Pillars
    story.append(Paragraph("SYSTEM ARCHITECTURE & CORE CAPABILITIES", section_heading))

    pillars_data = [
        [
            Paragraph("<b>1. Containerized SIEM Infrastructure</b>", ParagraphStyle('PHeader', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0369a1'))),
            Paragraph("Deploys a containerized Wazuh 4.9 SIEM, OpenSearch Indexer, and Filebeat pipeline via Docker Compose. Normalizes multi-source telemetry over Syslog (UDP 514).", body_style)
        ],
        [
            Paragraph("<b>2. Detection Engineering & MITRE Rules</b>", ParagraphStyle('PHeader', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0369a1'))),
            Paragraph("Features 20 custom XML correlation rules for Active Directory attacks (Kerberoasting T1558), Windows Sysmon MimiKatz dumping (T1003), Linux SUID escalation, and AWS root logins without MFA.", body_style)
        ],
        [
            Paragraph("<b>3. A.E.G.I.S. CYBER OPS Command UI</b>", ParagraphStyle('PHeader', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0369a1'))),
            Paragraph("A React 18 + Vite wallboard featuring a J.A.R.V.I.S. AI Voice Dispatcher (Web Speech API), Global Threat Trajectory Map, Security Advisory Radar, and 1-click active response playbooks.", body_style)
        ]
    ]

    p_table = Table(pillars_data, colWidths=[160, 380])
    p_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(p_table)
    story.append(Spacer(1, 6))

    # Technical Specifications Grid Table
    story.append(Paragraph("TECHNICAL SPECIFICATIONS & DETECTION CATALOG", section_heading))

    table_data = [
        [Paragraph("Component", table_header), Paragraph("Technologies Used", table_header), Paragraph("Key Detections & Capabilities", table_header)],
        [
            Paragraph("SIEM & Database", table_cell),
            Paragraph("Wazuh 4.9, OpenSearch 2.13, Filebeat, Docker Compose", table_cell),
            Paragraph("Real-time log correlation, OpenSearch indexing, TLS encryption", table_cell)
        ],
        [
            Paragraph("Log Telemetry", table_cell),
            Paragraph("Active Directory, Sysmon, Auditd, AWS CloudTrail, GuardDuty", table_cell),
            Paragraph("Kerberoasting, MimiKatz lsass.exe, Root MFA abuse, S3 leaks", table_cell)
        ],
        [
            Paragraph("Command Center UI", table_cell),
            Paragraph("React 18, Vite 8, Tailwind CSS, Web Speech/Audio APIs", table_cell),
            Paragraph("J.A.R.V.I.S. voice alerts, Global Threat Map, Interactive JSON simulator", table_cell)
        ],
        [
            Paragraph("Automation & IR", table_cell),
            Paragraph("Python 3 (log_replay.py), Bash (attack_simulation.sh)", table_cell),
            Paragraph("1-click IP null-routing (iptables), AWS IAM key revocation, /tmp purge", table_cell)
        ]
    ]

    spec_table = Table(table_data, colWidths=[100, 200, 240])
    spec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(spec_table)
    story.append(Spacer(1, 6))

    # Key Accomplishments / Project Summary Bullets
    story.append(Paragraph("PROJECT HIGHLIGHTS FOR EVALUATION", section_heading))
    story.append(Paragraph("• <b>Production-Ready Deployment:</b> Fully reproducible multi-container security stack initialized via single-command Docker Compose orchestration.", bullet_style))
    story.append(Paragraph("• <b>MITRE ATT&amp;CK Mapping:</b> 20 custom correlation rules created across 4 threat vectors with decoded JSON payload validation.", bullet_style))
    story.append(Paragraph("• <b>Voice-Enabled IR Playbooks:</b> Interactive React command center with J.A.R.V.I.S. speech alerts and automated active response scripts.", bullet_style))
    story.append(Paragraph("• <b>Open-Source Repository:</b> Source code, rules, decoders, and documentation published under MIT License on GitHub.", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generated successfully.")

if __name__ == "__main__":
    build_pdf()
