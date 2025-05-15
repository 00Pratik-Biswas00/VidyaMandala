from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from article_qa_gen.scrap_article import extract_article_content
import asyncio
from dotenv import load_dotenv
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7)

# Prompt templates
CONTEXT_SUMMARIZE_PROMPT = """You are an expert at creating educational content. 
Summarize the following article in a way that preserves key facts and concepts:
{article_content}"""

QUESTION_GENERATION_PROMPT = """Based on the following article content, generate {num_questions} 
thought-provoking questions that test comprehension. Format as a numbered list:

{article_summary}"""

QUESTION_SELECTION_PROMPT = """From these questions, select the one that would be most 
appropriate for testing a learner's understanding right now. Just return the question:

{questions_list}"""

ANSWER_EVALUATION_PROMPT = """Evaluate this answer to the question. Be specific about what's 
correct and what could be improved. Keep it constructive and under 3 sentences:

Question: {question}
Answer: {answer}"""

FINAL_REPORT_PROMPT = """Generate a comprehensive learning report based on these interactions.
Highlight strengths, areas for improvement, and key takeaways from the article:

{interaction_history}"""

# Chain definitions
summarize_chain = (
    {"article_content": RunnablePassthrough()}
    | ChatPromptTemplate.from_template(CONTEXT_SUMMARIZE_PROMPT)
    | llm
    | StrOutputParser()
)

question_gen_chain = (
    {"article_summary": RunnablePassthrough(), "num_questions": RunnablePassthrough()}
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

async def run_quiz_flow(article_url):
    """Async function to run the quiz flow"""
    try:
        # Extract content
        content = extract_article_content(article_url)
        if not content:
            return {"error": "Failed to extract article content"}, 400
        
        # Summarize content
        summary = await summarize_chain.ainvoke(content)
        
        # Generate initial questions
        questions = await question_gen_chain.ainvoke({"article_summary": summary, "num_questions": 5})
        questions_list = [q.strip() for q in questions.split('\n')[1:] if q.strip()]
        
        return {
            "status": "initialized",
            "summary": summary,
            "questions": questions_list
        }
    
    except Exception as e:
        logger.error(f"Error in initializing quiz: {str(e)}")
        return {"error": str(e)}, 500

async def select_question(questions_list):
    """Select a Questions from Question List"""
    try:
        selected_question = questions_list[0]
        # selected_question = await question_select_chain.ainvoke('\n'.join(questions_list))
        return{
            "current_question":selected_question
        }
    except Exception as e:
        logger.error(f"Error selecting question: {str(e)}")
        return {"error": str(e)}, 500

async def process_question_answer(questions_list, selected_question, user_answer, interaction_history):
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
        updated_questions = [q for q in questions_list if selected_question not in q]
        
        return {
            "updated_questions": updated_questions,
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

async def run_quiz(article_url):
    # Extract content
    content = extract_article_content(article_url)
    if not content:
        return "Failed to extract article content"
    
    # Summarize content
    summary = await summarize_chain.ainvoke(content)
    
    # Generate initial questions
    questions = await question_gen_chain.ainvoke({"article_summary": summary, "num_questions": 5})

    questions_list = [q.strip() for q in questions.split('\n') if q.strip()]
    # print(f"INITIAL QUESTION: {questions_list}")
    interaction_history = []
    continue_quiz = True
    
    while continue_quiz and len(questions_list)>1:
        # Select question
        selected_question = await question_select_chain.ainvoke('\n'.join(questions_list))
        
        # Get user answer
        print(f"\nQuestion: {selected_question}")
        user_answer = input("Your answer: ")
        
        # Evaluate answer
        evaluation = await eval_chain.ainvoke({
            "question": selected_question,
            "answer": user_answer
        })
        print(f"\nFeedback: {evaluation}")
        
        # Store interaction
        interaction_history.append({
            "question": selected_question,
            "answer": user_answer,
            "feedback": evaluation
        })
        
        # Remove used question
        questions_list = [q for q in questions_list if selected_question not in q]
        # print(questions_list)
        # Check if user wants to continue
        continue_input = input("\nContinue? (yes/no): ").lower()
        continue_quiz = continue_input.startswith('y')
    
    # Generate final report
    if interaction_history:
        report = await report_chain.ainvoke('\n\n'.join(
            f"Q: {item['question']}\nA: {item['answer']}\nFeedback: {item['feedback']}"
            for item in interaction_history
        ))
        print("\n=== FINAL REPORT ===")
        # print(report)
        return report
    
    return "No questions were answered."

async def test(url):
    init = await run_quiz_flow(url)
    summary = init['summary']
    questions_list = init['questions']
    interaction_history=[]
    selected_question = await question_select_chain.ainvoke('\n'.join(questions_list))
    # Get user answer
    print(f"\nQuestion: {selected_question}")
    user_answer = input("Your answer: ")

    process = await process_question_answer(questions_list,selected_question,user_answer,interaction_history)

    questions_list = process['updated_questions']
    interaction_history = process['interaction_history']
    print(process['feedback'])
    report = await generate_final_report(interaction_history)
    print(report)


async def test1():
    article_url = "https://www.w3schools.com/python/python_inheritance.asp"  # Replace with your article URL
    await run_quiz(article_url)


if __name__ == "__main__":
    asyncio.run(test('https://www.w3schools.com/python/python_inheritance.asp'))
