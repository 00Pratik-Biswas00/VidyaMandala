from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from block_diagram_generator.main import block_diagram_router
from article_qa_gen.main import article_quiz_router
from pdf_qa_summary_gen.main import pdf_summary_router
from learning_plan.main import learning_plan_router
from mock_interview.main import mock_interview_router

load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers with prefixes
app.include_router(article_quiz_router, prefix="/article")
app.include_router(block_diagram_router, prefix="/block")
app.include_router(pdf_summary_router, prefix="/pdf")
app.include_router(learning_plan_router, prefix="/learning")
app.include_router(mock_interview_router, prefix='/interview')



if __name__ == "__main__":
    import uvicorn
    if not os.getenv("GOOGLE_API_KEY"):
        raise EnvironmentError("GOOGLE_API_KEY not found in .env file!")
    uvicorn.run(app, host="0.0.0.0", port=5000)

    # for hot relod use:   uvicorn app:app --host 0.0.0.0 --port 5000 --reload