from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import traceback
from pdf_qa_summary_gen.pdf_summary import extract_text_from_pdf, generate_summary_from_text

pdf_summary_router = APIRouter()

@pdf_summary_router.post("/generate-summary")
async def generate_summary(pdf: UploadFile = File(...)):
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    pdf_path = os.path.join("uploads", pdf.filename)
    
    try:
        # Save the uploaded file
        with open(pdf_path, "wb") as buffer:
            buffer.write(await pdf.read())
        
        # Process the PDF
        text = extract_text_from_pdf(pdf_path)
        summary = generate_summary_from_text(text)
        
        return {"summary": summary}
        
    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Failed to generate summary"
        )
