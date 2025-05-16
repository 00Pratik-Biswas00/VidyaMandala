from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import traceback
from typing import List, Dict, Any
from pdf_qa_summary_gen.pdf_summary import extract_text_from_pdf, generate_summary_from_text
from pdf_qa_summary_gen.pdf_qa import generate_questions,generate_final_report,evaluate_answer,process_pdf,select_question
from pydantic import BaseModel
from typing import List

pdf_summary_router = APIRouter()

class QuestionRequest(BaseModel):
    questions: List[str] 


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
        text = process_pdf(pdf_path)
        summary = generate_summary_from_text("\n".join(text))
        
        return {"summary": summary}
        
    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Failed to generate summary"
        )


@pdf_summary_router.post('/generate-questions')
async def generate_questions_endpoint(pdf: UploadFile = File(...)):  # Renamed function
    os.makedirs("uploads", exist_ok=True)
    pdf_path = os.path.join("uploads", pdf.filename)  # Keep using the `pdf.filename`
    
    try:
        # Save the uploaded file
        with open(pdf_path, "wb") as buffer:
            buffer.write(await pdf.read())
        
        # Process the PDF
        text = process_pdf(pdf_path)
        result = await generate_questions("\n\n".join(text))  # Using the helper here

        return result
    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Failed to generate questions"
        )





@pdf_summary_router.post('/select-question')
async def select_questions(data: QuestionRequest):
    """Select a question from the list of questions"""
    try:
        questions_list = data.questions  # Access the questions list
        result = await select_question(questions_list)
        return result
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Failed to Select Question"
        )


@pdf_summary_router.post('/submit-answer')
async def submit_answer(data: Dict[str,Any]):
    try:
        question = data.get('question')
        answer = data.get('answer')
        context = data.get('context')
        history = data.get('history',[])

        result = await evaluate_answer(answer,context,history,question)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Failed to evaluate answer"
        ) 

@pdf_summary_router.post('/generate-report')
async def generate_report(data: Dict[str,Any]):
    try:
        interaction_history = data.get('history',[])
        result = await generate_final_report(interaction_history)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Failed to Generate Report"
        ) 