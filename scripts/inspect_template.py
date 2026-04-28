# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from docx import Document
from docx.oxml.ns import qn

TEMPLATE = r"c:\Users\Admin\Desktop\Licenta Adriana\documentatie\Proiect_Diploma_ghid_2025-2026_RO.docx"

doc = Document(TEMPLATE)
body = doc.element.body
all_elements = list(body)

print(f"Total elements: {len(all_elements)}")

sect_in_para = []
for i, el in enumerate(all_elements):
    if el.tag.endswith('}p'):
        pPr = el.find(qn('w:pPr'))
        if pPr is not None and pPr.find(qn('w:sectPr')) is not None:
            sect_in_para.append(i)

print(f"Section breaks in paragraphs at indices: {sect_in_para}")
for i in range(min(100, len(all_elements))):
    el = all_elements[i]
    if el.tag.endswith('}p'):
        text = "".join(node.text for node in el.iter() if node.tag.endswith('}t') and node.text)
        if text.strip():
            print(f"{i}: {text[:50]}")
