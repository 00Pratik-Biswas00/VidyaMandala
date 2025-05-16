import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from typing import List, Dict, Any
import json
import asyncio

# Load environment variables
load_dotenv()

# Configure Google Generative AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7)

# PDF Processing
def process_pdf(file_path: str) -> List[str]:
    """Extract and chunk text from PDF"""
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    
    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(pages)
    return [split.page_content for split in splits]

# Question Generation
async def generate_questions(context: str, num_questions: int = 5) -> List[str]:
    """Generate quiz questions from text content"""
    prompt = ChatPromptTemplate.from_template(
        """You are an expert at creating quiz content. Based on the following content, generate {num_questions} 
        thought-provoking questions that test comprehension. Format as a numbered list:
        
        Content: {context}
        """
    )
    
    chain = prompt | llm | StrOutputParser()
    try:
        questions = await chain.ainvoke({"context": context, "num_questions": num_questions})
        questions_list = [q.strip() for q in questions.split('\n')[1:] if q.strip()]
        return {
            'questions_list':questions_list
            }
    except Exception as e:
        return {"Error occured while generating questions": {str(e)}},500

async def select_question(questions_list):
    """Select a Questions from Question List"""
    try:
        selected_question = questions_list.pop(0)
        # selected_question = await question_select_chain.ainvoke('\n'.join(questions_list))
        return{
            "current_question":selected_question,
            'updated_questions':questions_list
        }
    except Exception as e:
        return {"Error selecting question ": str(e)}, 500

# Answer Evaluation
async def evaluate_answer(answer: str, context: str, interaction_history,question) -> Dict[str, Any]:
    """Evaluate user's answer and provide feedback"""
    prompt = ChatPromptTemplate.from_template(
        """You are a knowledgeable tutor. Evaluate the student's answer to the question based on the provided 
        context. Provide specific feedback on what was correct, what could be improved, and why. Keep it constructive and under 3 sentences:
        
        Question: {question}
        Student Answer: {answer}
        Context: {context}
        """
    )
    
    chain = prompt | llm | StrOutputParser()
    try:
        evaluation = await chain.ainvoke({"question": question, "answer": answer, "context": context})
        
        interaction_history.append({
            "question": question,
            "answer": answer,
            "feedback": evaluation
        })

        return {
            'feedback':evaluation,
            'history': interaction_history
        }
    except Exception as e:
        return {"Error occured while evaluating answer": {str(e)}},500

# Feedback Report Generation
async def generate_final_report(history: List[Dict[str, Any]]) -> str:
    """Generate a comprehensive feedback report"""
    prompt = ChatPromptTemplate.from_template(
        """Based on the following quiz history, generate a detailed feedback report for the student. 
        Highlight strengths, areas for improvement, and overall performance. Provide specific suggestions 
        for further study based on the questions that were challenging.
        
        Quiz History: {history}
        
        Structure your report with these sections:
        1. Overall Performance
        2. Strengths
        3. Areas for Improvement
        4. Recommended Study Focus
        5. Final Encouragement
        """
    )
    
    chain = prompt | llm | StrOutputParser()
    try:
        report = await chain.ainvoke({"history": json.dumps(history)})
        return {'report':report}
    except Exception as e:
        return {"Error occured while generating report": {str(e)}},500

# Main Quiz Function
async def run_pdf_quiz(file_path: str):
    """Run the interactive quiz session"""
    # Process PDF
    print("Processing PDF...")
    text_chunks = process_pdf(file_path)
    context = "\n\n".join(text_chunks)
    
    # Generate questions
    print("Generating questions...")
    questions = await generate_questions(context)
    
    quiz_history = []
    continue_quiz = True
    
    while continue_quiz and questions:
        # Select a question (remove it from list so it's not repeated)
        question = questions.pop(0)
        print(questions)
        print(f"\nQuestion: {question}")
        
        # Get user answer
        user_answer = input("Your answer: ")
        
        # Evaluate answer
        evaluation = await evaluate_answer(question, user_answer, context)
        print(f"\n{evaluation}")
        
        # Store in history
        quiz_history.append({
            "question": question,
            "user_answer": user_answer,
            "evaluation": evaluation
        })
        
        # Ask to continue
        continue_response = input("\nWould you like another question? (yes/no): ").lower()
        continue_quiz = continue_response in ['yes', 'y']
    
    # Generate final report
    if quiz_history:
        print("\nGenerating your final report...\n")
        report = await generate_final_report(quiz_history)
        print("=== FINAL FEEDBACK REPORT ===")
        print(report)
    else:
        print("No quiz history to generate report.")

# Run the program
if __name__ == "__main__":
    pdf_path = '/home/pawan/VidyaMandala/ml-services/uploads/ESSUserManual.pdf'
    asyncio.run(run_pdf_quiz(pdf_path))