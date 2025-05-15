from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from block_diagram_generator.diagram_gen import generate_diagram_from_text
import traceback
import base64
import os

block_diagram_router = APIRouter()

@block_diagram_router.post("/generate-diagram")
async def generate_diagram(request: Request):
    try:
        data = await request.json()
        content = data.get("text")

        if not content:
            raise HTTPException(status_code=400, detail="No text provided")

        paths = generate_diagram_from_text(content)
        png_path = paths["png"]
        pdf_path = paths["pdf"]

        # Convert PNG to base64 for frontend display
        with open(png_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

        return {
            "image": encoded_string,
            "pdf_url": "/download-diagram"  # Note the full path prefix
        }

    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Something went wrong")

@block_diagram_router.get("/download-diagram")
async def download_diagram():
    pdf_path = os.path.abspath("block_diagram_generator/diagram.pdf")
    if os.path.exists(pdf_path):
        return FileResponse(
            pdf_path,
            media_type='application/pdf',
            filename="diagram.pdf"
        )
    raise HTTPException(status_code=404, detail="PDF not found")