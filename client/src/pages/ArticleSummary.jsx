import React, { useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import Navbar from "../components/Navbar";
import Particle from "../components/Particle";

// API functions
const api = axios.create({
  baseURL: "http://localhost:5000/article",
  headers: { "Content-Type": "application/json" },
});

const initQuiz = async (url) => {
  const response = await api.post("/init-quiz", { url });
  return response.data;
};

const selectQuestion = async (questions) => {
  const response = await api.post("/select-question", { questions });
  return response.data;
};

const submitAnswer = async (questions, question, answer, history) => {
  const response = await api.post("/submit-answer", {
    questions,
    question,
    answer,
    interaction_history: history,
  });
  return response.data;
};

const generateReport = async (interactionHistory) => {
  const response = await api.post("/generate-report", {
    interaction_history: interactionHistory,
  });
  return response.data;
};

const ArticleSummary = () => {
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingStop, setLoadingStop] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const answerInputRef = useRef();
  const summaryRef = useRef();

  const [url, setUrl] = useState("");
  const [quizState, setQuizState] = useState({
    status: "idle", // 'idle', 'question', 'report-ready', 'report'
    summary: "",
    questions: [],
    currentQuestion: "",
    interactionHistory: [],
    feedback: "",
    report: "",
  });

  const handleInitQuiz = async () => {
    setLoadingStart(true);
    try {
      const result = await initQuiz(url);
      const selected = await selectQuestion(result.questions);

      setQuizState({
        status: "question",
        summary: result.summary,
        questions: result.questions,
        currentQuestion: selected.current_question,
        interactionHistory: [],
        feedback: "",
        report: "",
      });
    } catch (error) {
      console.error("Failed to initialize quiz:", error);
    } finally {
      setLoadingStart(false);
    }
  };

  const handleSubmitAnswer = async () => {
    setLoadingSubmit(true);
    const answer = answerInputRef.current?.value;
    if (!answer) return alert("Please write an answer.");

    try {
      const result = await submitAnswer(
        quizState.questions,
        quizState.currentQuestion,
        answer,
        quizState.interactionHistory
      );

      setQuizState((prev) => ({
        ...prev,
        questions: result.updated_questions,
        interactionHistory: result.interaction_history,
        feedback: result.feedback,
        status:
          result.updated_questions.length > 0 ? "question" : "report-ready",
      }));
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleNextQuestion = async () => {
    setLoadingNext(true);
    try {
      const selected = await selectQuestion(quizState.questions);
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: selected.current_question,
        feedback: "",
      }));
      answerInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to get next question:", error);
    } finally {
      setLoadingNext(false);
    }
  };

  const handleStopQuiz = async () => {
    setLoadingStop(true);
    try {
      const result = await generateReport(quizState.interactionHistory);
      setQuizState((prev) => ({
        ...prev,
        status: "report",
        report: result.report,
      }));
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoadingStop(false);
    }
  };

  const handleDownloadPDF = async () => {
    const input = summaryRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("article_quiz_report.pdf");
  };

  return (
    <>
      <Particle />
      <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-950 to-black text-white p-10 pb-24">
        <h1 className="text-4xl font-bold mb-10 font-montserrat">
          Practice Question and Answers from Articles
        </h1>

        {/* Input & Start */}
        {quizState.status === "idle" && (
          <div className="z-20 flex flex-col  sm:flex-row gap-4 w-full max-w-2xl mb-10">
            <input
              type="text"
              placeholder="Enter article link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="px-4 py-2 text-black bg-gray-200 font-mono rounded-md w-full focus:outline-none"
            />
            <button
              onClick={handleInitQuiz}
              className="bg-blue-600 hover:bg-blue-700 font-ubuntu font-semibold  text-white px-1 py-2 rounded-md  w-1/3"
              disabled={loadingStart} // Disable button while loadingStart
            >
              {loadingStart ? "Starting..." : "Start Quiz"}
            </button>
          </div>
        )}

        {/* Quiz Section */}
        {(quizState.status === "question" ||
          quizState.status === "report-ready") && (
          <div className="z-20 w-full max-w-5xl space-y-4">
            <h2 className="text-xl font-medium font-montserrat">Question:</h2>
            <div className="bg-gray-800 p-4 rounded-md font-open_sans">
              <ReactMarkdown>{quizState.currentQuestion}</ReactMarkdown>
            </div>

            <textarea
              placeholder="Your answer..."
              ref={answerInputRef}
              className="w-full p-3 h-[15rem] rounded-md text-black font-lato"
              rows={4}
            />

            <div className="flex gap-4 font-ubuntu font-medium">
              <button
                onClick={handleSubmitAnswer}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 duration-500 rounded-md"
                disabled={loadingSubmit} // Disable button while loadingSubmit
              >
                {loadingSubmit ? "Submitting..." : "Submit Answer"}
              </button>

              {quizState.status === "report-ready" ? (
                <button
                  onClick={handleStopQuiz}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 duration-500 rounded-md"
                  disabled={loadingStop} // Disable button while loadingStop
                >
                  {loadingStop ? "Generating..." : "Final Report"}
                </button>
              ) : (
                <button
                  onClick={handleStopQuiz}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 duration-500 rounded-md"
                  disabled={loadingStop} // Disable button while loadingStop
                >
                  {loadingStop ? "Stopping..." : "Stop Quiz"}
                </button>
              )}
            </div>

            {quizState.feedback && (
              <div className=" space-y-4">
                <h3 className="text-xl font-medium font-montserrat">
                  Feedback:
                </h3>
                <p className="bg-gradient-to-b from-blue-50 to-blue-200  text-black p-3 rounded-md font-lato">
                  {quizState.feedback}
                </p>

                {quizState.status === "question" && (
                  <button
                    onClick={handleNextQuestion}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 duration-500 font-ubuntu font-medium rounded-md"
                    disabled={loadingNext} // Disable button while loadingNext
                  >
                    {loadingNext ? "Generating..." : "Next Question"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Report */}
        {quizState.status === "report" && (
          <div className="z-20 w-full max-w-5xl mt-2 flex flex-col items-center justify-center gap-5 ">
            <div ref={summaryRef} className="bg-blue-200  p-7 rounded-xl">
              <h2 className="text-3xl font-bold mb-4 text-black font-montserrat">
                Final Report -
              </h2>

              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="my-6 text-2xl font-bold text-gray-950"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="my-6 text-xl font-playfair font-semibold text-gray-900"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      className="my-6 text-lg font-semibold text-gray-950"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p
                      className="mb-4 text-gray-800 leading-relaxed font-lato"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => (
                    <li
                      className="ml-6 list-disc mb-2 text-gray-800 font-lato"
                      {...props}
                    />
                  ),
                  pre: ({ ...props }) => (
                    <pre
                      className="ml-6 list-disc mb-2 text-gray-800 font-lato"
                      {...props}
                    />
                  ),
                }}
              >
                {quizState.report}
              </ReactMarkdown>
            </div>
            <button
              onClick={handleDownloadPDF}
              className=" bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-ubuntu"
            >
              Download PDF
            </button>
          </div>
        )}

        <Navbar />
      </section>
    </>
  );
};

export default ArticleSummary;