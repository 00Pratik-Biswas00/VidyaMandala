import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

import Navbar from "../components/Navbar";
import Particle from "../components/Particle";
import Header from "../components/Header";

const PdfSummary = () => {
  // QnA State Management
  const [quizState, setQuizState] = useState({
    status: "idle", // idle, question, report-ready, report
    currentQuestion: null,
    questions: [],
    feedback: null,
    report: null,
    isFinalQuestion: false,
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingStop, setLoadingStop] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const answerInputRef = useRef();
  const summaryRef = useRef();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };


  const handleInitQuiz = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    setLoadingStart(true);

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await fetch(
        "http://localhost:5000/pdf/generate-questions", // Backend API endpoint
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        setQuizState({
          status: "question",
          currentQuestion: data.questions_list[0],
          questions: data.questions_list.slice(1), // Remaining questions
          feedback: null,
          report: null,
        });
      } else {
        alert(data.detail || "Failed to generate QnA");
      }
    } catch (error) {
      console.error("Error while starting quiz:", error);
      alert("Something went wrong");
    } finally {
      setLoadingStart(false);
    }
  };


  const handleSubmitAnswer = async () => {
    const userAnswer = answerInputRef.current.value;
    if (!userAnswer) {
      alert("Please provide an answer.");
      return;
    }

    setLoadingSubmit(true);

    const { currentQuestion, questions, isFinalQuestion, interactionHistory  } = quizState;
    const context = ""; // Context would ideally come from the backend or preprocessed content

    try {
      const response = await fetch("http://localhost:5000/pdf/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          answer: userAnswer,
          context: context,
          history: interactionHistory,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setQuizState((prevState) => ({
          ...prevState,
          interactionHistory: data.history,
          feedback: data.feedback,
          status: isFinalQuestion ? "report-ready" : prevState.status,
        }));
      } else {
        alert(data.detail || "Failed to evaluate answer.");
      }
    } catch (error) {
      console.error("Error while submitting answer:", error);
      alert("Something went wrong");
    } finally {
      setLoadingSubmit(false);
    }
  };


  const handleNextQuestion = async () => {
  setLoadingNext(true);

  const { questions } = quizState;

  try {
    const response = await fetch("http://localhost:5000/pdf/select-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }), // Ensure this matches the expected schema
    });

    const data = await response.json();
    if (response.ok) {
      setQuizState((prevState) => ({
        ...prevState,
        currentQuestion: data.current_question,
        questions: data.updated_questions,
        feedback: "",
        isFinalQuestion: data.updated_questions.length === 0,
      }));
    } else {
      alert(data.detail || "Failed to fetch next question.");
    }
    answerInputRef.current.value = "";
  } catch (error) {
    console.error("Error while fetching next question:", error);
    alert("Something went wrong");
  } finally {
    setLoadingNext(false);
  }
};

  const handleStopQuiz = async () => {
    setLoadingStop(true);
    const { interactionHistory } = quizState;
    try {
      const response = await fetch("http://localhost:5000/pdf/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: interactionHistory,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setQuizState({
          ...quizState,
          status: "report",
          report: data.report,
        });
      } else {
        alert(data.detail || "Failed to generate report.");
      }
    } catch (error) {
      console.error("Error while generating report:", error);
      alert("Something went wrong");
    } finally {
      setLoadingStop(false);
    }
  };


  const handleGenerateSummary = async () => {
    
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await fetch(
        "http://localhost:5000/pdf/generate-summary",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
      } else {
        alert(data.error || "Failed to generate summary");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
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
    pdf.save("pdf_summary.pdf");
  };

  return (
    <>
      <div className="z-20 absolute w-full"><Header/></div>
      <Particle />
      <section className="  flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-950 to-black text-white p-24">
        <h1 className="z-20 text-lg px-4 font-semibold mb-10 truncate max-w-md text-center  bg-gray-800 bg-opacity-70 border border-gray-600 rounded-full py-3 shadow-sm tracking-wider">
          Practice Question and Answers from PDFs
        </h1>
      {quizState.status === "idle" && (
        <div className="z-20 flex flex-col  gap-4 w-full max-w-2xl mb-10 items-center justify-center">
          {/* PDF Upload Button */}
          <label className="w-full sm:w-auto bg-transparent border border-white hover:bg-slate-600 duration-500  text-white  px-4 py-2 rounded-md cursor-pointer text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            Upload PDF
          </label>

          {pdfFile && (
            <p className="text-green-300 ">
              {pdfFile.name} is uploaded ✅
            </p>
          )}

          {/* Generate QnA Button */}
          <div className="flex  items-center justify-center gap-5">
            <button
              className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800 duration-500 font-medium text-white px-4 py-2 rounded-md w-full sm:w-auto"
              onClick={handleInitQuiz}
              disabled={loadingStart}
            >
              {loadingStart ? "Starting QnA..." : "Start QnA"}
            </button>

            {/* Summary Button */}
            <button
              onClick={handleGenerateSummary}
              className="bg-gradient-to-r from-blue-700 to-blue-400 hover:from-blue-800 hover:to-blue-600 duration-500 font-medium text-white px-4 py-2 rounded-md "
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Summary"}
            </button>
          </div>
        </div>
      )}


        {/* Question & Feedback UI */}
        {(quizState.status === "question" || quizState.status === "report-ready") && (
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
                className="bg-gradient-to-b from-green-400 to-green-700 hover:from-green-600 hover:to-green-800 px-4 py-2 duration-500 rounded-md"
                disabled={loadingSubmit} // Disable button while loadingSubmit
              >
                {loadingSubmit ? "Submitting..." : "Submit Answer"}
              </button>

              {quizState.status === "report-ready" ? (
                <button
                  onClick={handleStopQuiz}
                  className="bg-gradient-to-b from-yellow-400 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 px-4 py-2 duration-500 rounded-md"
                  disabled={loadingStop} // Disable button while loadingStop
                >
                  {loadingStop ? "Generating..." : "Final Report"}
                </button>
              ) : (
                <button
                  onClick={handleStopQuiz}
                  className="bg-gradient-to-b from-red-400 to-red-700 hover:from-red-600 hover:to-red-800 px-4 py-2 duration-500 rounded-md"
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
                    className="mt-4 bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-4 py-2 duration-500 font-ubuntu font-medium rounded-md"
                    disabled={loadingNext} // Disable button while loadingNext
                  >
                    {loadingNext ? "Generating..." : "Next Question"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Final Report */}
        {quizState.status === "report" && (
          <div className="z-20 max-w-3xl mt-2 flex flex-col items-center justify-center gap-5 ">
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
              className=" bg-gradient-to-r from-green-400 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-2 rounded-md font-ubuntu"
            >
              Download PDF
            </button>
          </div>
         )}




        {/* summary */}
        {summary && (
          <div className="z-20 flex flex-col items-center justify-center gap-5 w-full h-full max-w-5xl">
            <div
              ref={summaryRef}
              className="  bg-blue-200  p-7 rounded-xl text-black  mt-5"
            >
              <h2 className="font-bold text-lg mb-2">📄 Summary:</h2>
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="my-6 text-2xl font-bold text-blue-800"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="my-6 text-xl font-semibold text-blue-700"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      className="my-6 text-lg font-semibold text-blue-600"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p
                      className="mb-4 text-gray-800 leading-relaxed"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => (
                    <li className="ml-6 list-disc mb-2" {...props} />
                  ),
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>{" "}
            <button
              onClick={handleDownloadPDF}
              className=" bg-gradient-to-r from-green-400 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-2 rounded-md"
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

export default PdfSummary;
