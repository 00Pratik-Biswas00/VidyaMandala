import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Particle from "../components/Particle";

const LearningPlan = () => {
  const [months, setMonths] = useState("");
  const [hours, setHours] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState("input"); // 'input', 'quiz', 'result'
  const [result, setResult] = useState(null);

  const handleStartQuiz = async () => {
    try {
      const res = await axios.get("http://localhost:5000/learning/quiz");
      setQuestions(res.data.questions);
      setStep("quiz");
    } catch (err) {
      console.error("Error fetching quiz:", err);
    }
  };

  const handleOptionChange = (qid, selectedOption) => {
    setAnswers({ ...answers, [qid]: selectedOption });
  };

  const handleSubmitQuiz = async () => {
    const score = questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.answer ? 1 : 0);
    }, 0);

    try {
      const res = await axios.post(
        "http://localhost:5000/learning/generate-plan",
        {
          months: parseInt(months),
          hours: parseInt(hours),
          score,
        }
      );
      setResult(res.data);
      setStep("result");
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };

  return (
    <>
      <Particle />
      <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-950 to-black text-white p-10 pb-24">
        <h1 className="z-20 text-4xl font-bold mb-10 font-montserrat">
          Daily Learning Plan Generator
        </h1>

        {step === "input" && (
          <>
            <p className="mb-10 max-w-5xl text-center">
              Start by telling us how long you want to study and how much time
              you can spend daily. Then take a short quiz to customize your
              plan!
            </p>
            <div className="z-20 flex flex-col items-center justify-center gap-5 bg-blue-950 p-7 rounded-2xl">
              <label className="w-full text-white font-mono text-lg flex flex-col gap-2">
                Expected Completion timeframe (Months)?
                <input
                  type="text"
                  placeholder="e.g. 6"
                  className="px-4 py-2 text-black bg-gray-200 font-mono rounded-md focus:outline-none"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                />
              </label>
              <label className="w-full text-white font-mono text-lg flex flex-col gap-2">
                Daily study commitment (Hours)?
                <input
                  type="text"
                  placeholder="e.g. 3"
                  className="px-4 py-2 text-black bg-gray-200 font-mono rounded-md focus:outline-none"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </label>
              <button
                onClick={handleStartQuiz}
                className="bg-blue-600 hover:bg-blue-700 font-ubuntu font-semibold text-white px-1 py-2 rounded-md w-1/3"
              >
                Start Quiz
              </button>
            </div>
          </>
        )}

        {step === "quiz" && (
          <div className="z-20 flex flex-col gap-6 bg-blue-950 p-7 rounded-2xl w-full max-w-3xl">
            <h2 className="text-2xl font-semibold font-montserrat text-center">
              Quiz - Answer 5 Questions
            </h2>
            {questions.map((q, idx) => (
              <div key={q.id} className="text-white font-mono">
                <p className="mb-2">
                  <strong>Q{idx + 1}:</strong> {q.question}
                </p>
                <div className="flex flex-col gap-1 pl-4">
                  {q.options.map((opt) => (
                    <label key={opt}>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleOptionChange(q.id, opt)}
                        className="mr-2"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleSubmitQuiz}
              className="bg-green-600 hover:bg-green-700 font-ubuntu font-semibold text-white px-4 py-2 rounded-md mx-auto mt-4"
            >
              Submit Quiz
            </button>
          </div>
        )}

        {step === "result" && result && (
          <div className="z-20 flex flex-col items-center gap-4 bg-blue-950 p-7 rounded-2xl w-full max-w-3xl">
            <h2 className="text-3xl font-bold font-montserrat">
              Your Personalized Plan
            </h2>
            <p className="text-lg font-mono">Score: {result.score}/5</p>
            <p className="text-white font-mono mt-4 text-center">
              {result.plan}
            </p>
            <button
              onClick={() => {
                setStep("input");
                setMonths("");
                setHours("");
                setQuestions([]);
                setAnswers({});
                setResult(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 font-ubuntu font-semibold text-white px-4 py-2 rounded-md mt-6"
            >
              Generate Again
            </button>
          </div>
        )}

        <Navbar />
      </section>
    </>
  );
};

export default LearningPlan;
