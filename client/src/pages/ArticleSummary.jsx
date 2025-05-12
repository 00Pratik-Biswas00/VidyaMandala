import React, { useState } from "react";
import axios from "axios";

const ArticleSummary = () => {
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);  // New state for loading

  const handleSubmit = async () => {
    setLoading(true);  // Start loading state
    try {
      const res = await axios.post("http://localhost:8000/start", { url });
      setQuestion(res.data.question);
      setFeedback("");  // Reset feedback when new question is fetched
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);  // End loading state
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) {
      alert("Please provide an answer.");
      return;
    }
    
    setLoading(true);  // Start loading state
    try {
      const res = await axios.post("http://localhost:8000/answer", { answer });
      setFeedback(res.data.feedback);
      setQuestion(res.data.next_question);
      setAnswer("");  // Reset the answer field after submission
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);  // End loading state
  };

  return (
    <section className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Article Tutor</h1>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-6">
        <input
          type="text"
          placeholder="Enter article link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-4 py-2 text-black rounded-md w-full focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          disabled={loading}  // Disable button while loading
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>

      {question && (
        <div className="bg-white text-black p-4 rounded-md w-full max-w-xl mb-4">
          <p className="font-semibold mb-2">Question:</p>
          <p>{question}</p>
        </div>
      )}

      {question && (
        <>
          <textarea
            rows="4"
            placeholder="Your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="text-black px-4 py-2 rounded-md w-full max-w-xl mb-4"
          />
          <button
            onClick={handleAnswerSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            disabled={loading}  // Disable button while loading
          >
            {loading ? "Loading..." : "Submit Answer"}
          </button>
        </>
      )}

      {feedback && (
        <div className="bg-green-100 text-black p-4 mt-4 rounded-md w-full max-w-xl">
          <p className="font-semibold mb-2">Feedback:</p>
          <p>{feedback}</p>
        </div>
      )}
    </section>
  );
};

export default ArticleSummary;
