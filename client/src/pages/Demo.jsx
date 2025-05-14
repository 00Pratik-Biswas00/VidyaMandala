import React, { useState, useRef } from "react";

// api.js - Axios configuration
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/article",
  headers: {
    "Content-Type": "application/json",
  },
});

// Initialize quiz with article URL
export const initQuiz = async (url) => {
  try {
    const response = await api.post("/init-quiz", { url });
    return response.data;
  } catch (error) {
    console.error("Error initializing quiz:", error);
    throw error;
  }
};

// select questions
export const selectQuestion = async (questions) => {
  try {
    const response = await api.post("/select-question", { questions });
    return response.data;
  } catch (error) {
    console.error("Error selecting questions:", error);
    throw error;
  }
};

// Submit answer to a question
export const submitAnswer = async (questions, question, answer, history) => {
  try {
    const response = await api.post("/submit-answer", {
      questions,
      question,
      answer,
      interaction_history: history,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
};

// Generate final report
export const generateReport = async (interactionHistory) => {
  try {
    const response = await api.post("/generate-report", {
      interaction_history: interactionHistory,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

function ArticleSummary() {
  const answerInputRef = useRef();
  const [url, setUrl] = useState("");
  const [quizState, setQuizState] = useState({
    status: "idle", // 'idle', 'initialized', 'question', 'report'
    summary: "",
    questions: [],
    currentQuestion: "",
    interactionHistory: [],
    feedback: "",
    report: "",
  });

  const handleInitQuiz = async () => {
    try {
      const result = await initQuiz(url);
      setQuizState({
        ...quizState,
        status: "initialized",
        summary: result.summary,
        questions: result.questions,
        interactionHistory: [],
      });
    } catch (error) {
      console.error("Failed to initialize quiz:", error);
    }
  };

  const handleSelectQuestion = async () => {
    const result = await selectQuestion(quizState.questions);
    console.log(JSON.stringify(result))
    setQuizState({
      ...quizState,
      status: "question",
      currentQuestion: result.current_question,
    });
  };

  const handleSubmitAnswer = async (answer) => {
    try {
      const result = await submitAnswer(
        quizState.questions,
        quizState.currentQuestion,
        answer,
        quizState.interactionHistory
      );

      setQuizState({
        ...quizState,
        questions: result.updated_questions,
        interactionHistory: result.interaction_history,
        feedback: result.feedback,
        status:
          result.updated_questions.length > 1 ? "initialized" : "report-ready",
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const result = await generateReport(quizState.interactionHistory);
      setQuizState({
        ...quizState,
        report: result.report,
        status: "report",
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  return (
    <div className="quiz-app">
      {quizState.status === "idle" && (
        <div>
          <h1>Article Quiz</h1>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter article URL"
          />
          <button onClick={handleInitQuiz}>Start Quiz</button>
        </div>
      )}

      {quizState.status === "initialized" && (
        <div>
          <h2>Article Summary</h2>
          {/* <p>{quizState.summary}</p> */}
          <button onClick={handleSelectQuestion}>Get Question</button>
          {/* close session button */}
        </div>
      )}

      {quizState.status === "question" && (
        <div>
          <h2>Question</h2>
          <p>{quizState.currentQuestion}</p>
          <textarea placeholder="Your answer..." ref={answerInputRef}
          ></textarea>
          <button onClick={() => handleSubmitAnswer(answerInputRef.current?.value)}>
            Submit Answer
          </button>
        </div>
      )}

      {quizState.feedback && (
        <div>
          <h3>Feedback</h3>
          <p>{quizState.feedback}</p>
          {quizState.status === "report-ready" && (
            <button onClick={handleGenerateReport}>
              Generate Final Report
            </button>
          )}
        </div>
      )}

      {quizState.status === "report" && (
        <div>
          <h2>Final Report</h2>
          <p>{quizState.report}</p>
        </div>
      )}
    </div>
  );
}

export default ArticleSummary;
