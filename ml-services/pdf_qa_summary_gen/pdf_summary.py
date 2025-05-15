import os
import fitz  # PyMuPDF
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using PyMuPDF."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

def generate_summary_from_text(text):
    """Use Gemini to generate a precise summary which also includes key points and important questions and answers."""
    prompt = f"""Summarize the following educational content into a clear, concise, and reader-friendly summary also includes key points and important questions and answers:\n\n{text}\n\nSummary:"""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()
