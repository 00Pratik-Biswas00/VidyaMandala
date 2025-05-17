from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import asyncio
from dotenv import load_dotenv
import logging
import os

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7)

# Mock course database
COURSE_DATABASE = {
    "python_101": {
        "title": "Python Fundamentals",
        "content": """
        This course covers Python basics including:
        - Variables and data types
        - Control structures (if-else, loops)
        - Functions and modules
        - File handling
        - Object-oriented programming concepts
        - Basic error handling
        """
    },
    "web_dev": {
        "title": "Web Development Basics",
        "content": """
        This course covers:
        - HTML5 fundamentals
        - CSS styling
        - JavaScript basics
        - DOM manipulation
        - HTTP protocol
        - REST API concepts
        """
    }
}

# Prompt templates
INTERVIEWER_PROMPT = """You are a professional technical interviewer conducting a mock interview 
for the course: {course_title}. Your role is to:
1. Ask technical and theoretical questions appropriate for this course level
2. Evaluate answers professionally
3. Provide constructive feedback
4. Maintain a professional yet friendly tone

Course content overview:
{course_content}"""

QUESTION_GENERATION_PROMPT = """Based on the course topics name below, generate {num_questions} 
short one liner technical interview questions that properly assess understanding of concepts.
Format as a numbered list:
Example : 1. question, 2. question

{course_content}"""

QUESTION_SELECTION_PROMPT = """From these technical interview questions, select the one that would 
be most appropriate to ask next in a mock interview setting. Consider:
- Logical progression of concepts
- Importance of the topic
- Avoid redundancy with previous questions

Just return the selected question:

{questions_list}"""

ANSWER_EVALUATION_PROMPT = """As a professional technical interviewer, Evaluate this answer to the question. Be specific about what's 
correct and what could be improved. Keep it constructive and under 3 sentences:
Question: {question}
Answer: {answer}
"""

FINAL_REPORT_PROMPT = """Generate a comprehensive interview performance Markdown report based on these 
interactions. on format:

1. Overall performance summary
2. Technical strengths demonstrated
3. Key areas needing improvement

Interview History:
{interaction_history}

Just follow the format and dont include any of these Candidate, Role ,Date or any extra text"""

# Chain definitions
question_gen_chain = (
    {"course_content": RunnablePassthrough(), "num_questions": RunnablePassthrough()}
    | ChatPromptTemplate.from_template(QUESTION_GENERATION_PROMPT)
    | llm
    | StrOutputParser()
)

question_select_chain = (
    {"questions_list": RunnablePassthrough()}
    | ChatPromptTemplate.from_template(QUESTION_SELECTION_PROMPT)
    | llm
    | StrOutputParser()
)

eval_chain = (
    {"question": RunnablePassthrough(), "answer": RunnablePassthrough()}
    | ChatPromptTemplate.from_template(ANSWER_EVALUATION_PROMPT)
    | llm
    | StrOutputParser()
)

report_chain = (
    {"interaction_history": RunnablePassthrough()}
    | ChatPromptTemplate.from_template(FINAL_REPORT_PROMPT)
    | llm
    | StrOutputParser()
)

async def get_course_content(course_id: str) -> dict:
    """Retrieve course content from mock database"""
    course = COURSE_DATABASE.get(course_id)
    if not course:
        raise ValueError(f"Course {course_id} not found")
    return course

async def initialize_interview(course: str):
    """Initialize interview session"""
    try:
        # course = await get_course_content(course_id)
        questions = await question_gen_chain.ainvoke({
            "course_content": course,
            "num_questions": 5
        })
        questions_list = [q.strip() for q in questions.split('\n')[1:] if q.strip()]
        
        return {
            "questions": questions_list,
            "interaction_history": []
        }
    
    except Exception as e:
        logger.error(f"Error initializing interview: {str(e)}")
        raise

async def select_question(question_list):
    try:
        selected_question = question_list.pop(0)
        # selected_question = await question_select_chain.ainvoke('\n'.join(questions_list))
        return{
            "current_question":selected_question,
            'updated_list' : question_list
        }
    except Exception as e:
        logger.error(f"Error selecting question: {str(e)}")
        return {"error": str(e)}, 500
    

async def process_question_answer(selected_question, user_answer, interaction_history):
    """Process a single question-answer interaction"""
    try:
        # Evaluate answer
        evaluation = await eval_chain.ainvoke({
            "question": selected_question,
            "answer": user_answer
        })
        
        # Update interaction history
        interaction_history.append({
            "question": selected_question,
            "answer": user_answer,
            "feedback": evaluation
        })
        
        # Remove used question
        # updated_questions = [q for q in questions_list if selected_question not in q]
        
        return {
            "interaction_history": interaction_history,
            "feedback": evaluation
        }
    
    except Exception as e:
        logger.error(f"Error processing answer: {str(e)}")
        return {"error": str(e)}, 500
    
async def generate_final_report(interaction_history):
    """Generate final report"""
    try:
        report = await report_chain.ainvoke('\n\n'.join(
            f"Q: {item['question']}\nA: {item['answer']}\nFeedback: {item['feedback']}"
            for item in interaction_history
        ))
        return {"report": report}
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return {"error": str(e)}, 500
    
async def conduct_interview(course_id: str):
    """Main interview flow"""
    try:
        # Initialize interview
        session = await initialize_interview(course_id)
        questions = session["questions"]
        interaction_history = session["interaction_history"]
        
        # Greet candidate
        # greeting = f"Welcome to your mock interview for {session['course_title']}. Let's begin."
        # print(f"\nInterviewer: {greeting}")
        # audio.text_to_speech(greeting)
        continue_quiz = True
        while continue_quiz and questions:
            # Select question
            # selected_question = await question_select_chain.ainvoke('\n'.join(questions))
            print(f'''
-----------------------current question list-----------------
                  \n{questions}\n
------------------------------------------------------\n\n
                  ''')
            selected_question = await select_question(questions)
            print(f"\nInterviewer: {selected_question['current_question']}")
            
            # Get user answer
            user_answer = input('your Answer: ')
                
            print(f"\nYou: {user_answer}")
            
            # Evaluate answer
            evaluation = await eval_chain.ainvoke({
                "question": selected_question,
                "answer": user_answer
            })
            
            # Store interaction
            interaction_history.append({
                "question": selected_question,
                "answer": user_answer,
                "feedback": evaluation
            })
            
            # Remove used question
            # questions = [q for q in questions if selected_question not in q]
            
            # Provide feedback
            print(f"\nInterviewer Feedback:\n{evaluation}")
            # audio.text_to_speech(f"Feedback on your answer. {evaluation.split('Model Answer:')[0]}")
            
            # Check if user wants to continue
            continue_input = input("\nContinue? (yes/no): ").lower()
            continue_quiz = continue_input.startswith('y')
        
        # Generate final report
        if interaction_history:
            report = await report_chain.ainvoke('\n\n'.join(
                f"Q: {item['question']}\nA: {item['answer']}\nFeedback: {item['feedback']}"
                for item in interaction_history
            ))
            print("\n=== INTERVIEW REPORT ===")
            print(report)
            # audio.text_to_speech(f"Here is your final interview report. {report}")
        
        return {"status": "completed", "report": report}
    
    except Exception as e:
        logger.error(f"Error during interview: {str(e)}")
        return {"error": str(e)}

async def main():
    # print("Available courses:")
    # for i, course_id in enumerate(COURSE_DATABASE.keys(), 1):
    #     print(f"{i}. {course_id} - {COURSE_DATABASE[course_id]['title']}")
    
    # course_id = input("\nEnter course ID to start mock interview: ").strip()
    # if course_id not in COURSE_DATABASE:
    #     print("Invalid course ID")
    #     return
    
    print("\nStarting mock interview...")
    await conduct_interview('python_101')

if __name__ == "__main__":
    asyncio.run(main())
    
