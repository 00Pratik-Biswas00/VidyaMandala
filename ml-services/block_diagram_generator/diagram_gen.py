import os
import google.generativeai as genai
from graphviz import Source

# Load Gemini API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_diagram_from_text(text, output_dir="block_diagram_generator"):
    # Prompt Gemini to generate dot language code
    prompt = f"""You are a diagram generator. Based on the following input, return a block diagram in DOT language (graphviz). Text: {text} Return only the DOT code."""

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    dot_code = response.text.strip("```dot").strip("```").strip()

    # Render diagram to PDF and PNG
    s = Source(dot_code, filename="diagram", format="pdf")
    s.render(directory=output_dir, cleanup=True)
    
    s_png = Source(dot_code, filename="diagram", format="png")
    s_png.render(directory=output_dir, cleanup=True)

    pdf_path = os.path.abspath(os.path.join(output_dir, "diagram.pdf"))
    png_path = os.path.abspath(os.path.join(output_dir, "diagram.png"))

    return {
        "pdf": pdf_path,
        "png": png_path
    }
