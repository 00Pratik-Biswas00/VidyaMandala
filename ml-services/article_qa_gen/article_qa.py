from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from scrap_article import extract_article_content
import asyncio

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
        print(questions_list)
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
        print(report)
        return report
    
    return "No questions were answered."

async def main():
    article_url = "https://www.geeksforgeeks.org/binary-search/"  # Replace with your article URL
    await run_quiz_flow(article_url)


if __name__ == "__main__":
    asyncio.run(main())
