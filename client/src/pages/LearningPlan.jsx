import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Particle from "../components/Particle";
import { courseService } from "../services/courseService";
import { authService } from "../services/authService";
import { mlService } from "../services/mlService";
import { enrollmentService } from "../services/enrollmentService"; // Add this import

const LearningPlan = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);  // Add enrollment state
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);  // Add this state
  const [months, setMonths] = useState("1");
  const [hours, setHours] = useState("2");
  const [step, setStep] = useState("input");
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    if (!authService.isLoggedIn()) {
      navigate("/login");
      return;
    }
    
    // Make sure courseId is actually available
    if (!courseId) {
      setError("Missing course ID. Please return to the course page and try again.");
      return;
    }
    
    console.log("Learning Plan - Course ID:", courseId);

    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log("Attempting to fetch course with ID:", courseId);
        const response = await courseService.getCourseById(courseId);
        
        if (!response || !response.course) {
          setError("Course not found. Please check the URL and try again.");
          return;
        }
        
        setCourse(response.course);
        console.log("Course fetched successfully:", response.course.title);
        
        // Check enrollment status
        setCheckingEnrollment(true);
        try {
          const enrolled = await enrollmentService.checkEnrollmentStatus(courseId);
          setIsEnrolled(enrolled);
          
          if (!enrolled) {
            setError("You must be enrolled in this course to generate a learning plan.");
          }
        } catch (err) {
          console.error("Failed to check enrollment status:", err);
          setError("Failed to verify course enrollment status.");
        } finally {
          setCheckingEnrollment(false);
        }
        
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError("Course not found or error loading course data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);


  const handleStartQuiz = async () => {
    try {
      // Check enrollment status again before proceeding
      if (!isEnrolled) {
        setError("You must be enrolled in this course to generate a learning plan.");
        return;
      }
      
      setQuizLoading(true);
      
      // Validate input
      const monthsNum = parseInt(months);
      const hoursNum = parseInt(hours);
      
      if (isNaN(monthsNum) || monthsNum <= 0 || isNaN(hoursNum) || hoursNum <= 0) {
        setError("Please enter valid numbers for months and hours");
        return;
      }
      
      // Check if courseId is defined before making the request
      if (!courseId) {
        setError("Course ID is missing. Please return to the course page and try again.");
        setQuizLoading(false);
        return;
      }
      
      console.log("Fetching quiz for courseId:", courseId);
      
      // Fetch quiz questions for this course
      const fetchedQuestions = await mlService.getCourseQuiz(courseId);
      
      // Check if we got valid questions back
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setError("No quiz questions available for this course. Please try another course.");
        setQuizLoading(false);
        return;
      }
      
      setQuestions(fetchedQuestions);
      setStep("quiz");
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError("Failed to load quiz questions. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleOptionChange = (qid, selectedOption) => {
    setAnswers({ ...answers, [qid]: selectedOption });
  };

  const handleSubmitQuiz = () => {
    // Check if all questions have answers
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      alert(
        `Please answer all questions (${answeredCount}/${questions.length} answered)`
      );
      return;
    }

    // Calculate score based on correct answers
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.answer) {
        correctAnswers++;
      }
    });

    const calculatedScore = Math.floor((correctAnswers / questions.length) * 5);
    setScore(calculatedScore);

    // Generate the learning plan
    handleGeneratePlan(calculatedScore);
  };

  const handleGeneratePlan = async (finalScore) => {
    try {
      setLoading(true);
      const monthsNum = parseInt(months);
      const hoursNum = parseInt(hours);
      
      console.log("Generating plan with params:", {
        courseId, months: monthsNum, hours: hoursNum, score: finalScore
      });
      
      // Make sure we have all required data
      if (!courseId) {
        setError("Course ID is missing. Cannot generate learning plan.");
        return;
      }
      
      // Call the ML service
      const response = await mlService.generateLearningPlan(
        courseId,
        monthsNum,
        hoursNum,
        finalScore
      );
      
      console.log("Plan generation result:", response);
      
      // Check response
      if (!response || typeof response.plan !== 'string') {
        setError("Invalid response from learning plan service");
        return;
      }
      
      setResult({
        score: finalScore,
        plan: response.plan,
      });
      
      setStep("result");
    } catch (err) {
      console.error("Failed to generate plan:", err);
      
      // Show more detailed error message
      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail || '';
        setError(`Server error (${status}): ${detail || "Failed to generate learning plan"}`);
      } else if (err.request) {
        setError("No response received from server. Please check if the ML service is running.");
      } else {
        setError("Failed to generate learning plan: " + (err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (checkingEnrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isEnrolled && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black flex items-center justify-center text-white">
        <div className="text-center p-8 max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Enrollment Required</h2>
          <p className="mb-6">You must be enrolled in {course?.title || "this course"} to generate a learning plan.</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate(`/details/${course?.title || ""}`)}
              className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Course
            </button>
            <button 
              onClick={() => navigate("/")}
              className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black flex items-center justify-center text-white">
        <div className="text-center p-8 max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              // Don't reset anything else - keep courseId and other state intact
              if (course) {
                // If we have the course, just go back to the input step
                setStep("input");
              } else if (courseId) {
                // If we have courseId but no course, try fetching again
                window.location.reload();
              } else {
                // If no courseId, return to courses page
                navigate("/");
              }
            }}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {course ? "Try Again" : courseId ? "Reload Page" : "Back to Courses"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Particle />
      <section className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-950 to-black text-white p-10 pb-24">
        <h1 className="z-20 text-4xl font-bold mb-10 font-montserrat">
          Daily Learning Plan Generator
        </h1>

        {course && (
          <div className="mb-6 bg-blue-900/50 px-4 py-2 rounded-lg">
            <span className="font-medium">Course: </span>
            <span className="text-blue-200">{course.title}</span>
          </div>
        )}

        {step === "input" && (
          <>
            <p className="mb-10 max-w-5xl text-center">
              Start by telling us how long you want to study and how much time
              you can spend daily. Then take a short quiz to customize your
              plan!
            </p>
            <div className="z-20 flex flex-col items-center justify-center gap-5 bg-blue-950 p-7 rounded-2xl w-full max-w-lg">
              <label className="w-full text-white font-mono text-lg flex flex-col gap-2">
                Expected Completion timeframe (Months)?
                <input
                  type="number"
                  placeholder="e.g. 6"
                  min="1"
                  className="px-4 py-2 text-black bg-gray-200 font-mono rounded-md focus:outline-none"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                />
              </label>
              <label className="w-full text-white font-mono text-lg flex flex-col gap-2">
                Daily study commitment (Hours)?
                <input
                  type="number"
                  placeholder="e.g. 3"
                  min="1"
                  className="px-4 py-2 text-black bg-gray-200 font-mono rounded-md focus:outline-none"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </label>
              <button
                onClick={handleStartQuiz}
                disabled={quizLoading}
                className="bg-blue-600 hover:bg-blue-700 font-ubuntu font-semibold text-white px-6 py-2 rounded-md w-full md:w-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quizLoading ? "Loading Quiz..." : "Start Quiz"}
              </button>
            </div>
          </>
        )}

        {step === "quiz" && (
          <div className="z-20 flex flex-col gap-6 bg-blue-950 p-7 rounded-2xl w-full max-w-3xl">
            <h2 className="text-2xl font-semibold font-montserrat text-center">
              Quiz - Answer {questions.length} Questions
            </h2>
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="text-white font-mono bg-blue-900/30 p-4 rounded-lg"
              >
                <p className="mb-2">
                  <strong>Q{idx + 1}:</strong> {q.question}
                </p>
                <div className="flex flex-col gap-1 pl-4">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center hover:bg-blue-800/30 p-1 rounded cursor-pointer"
                    >
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
          <div className="z-20 flex flex-col gap-4 bg-blue-900 p-7 rounded-2xl w-full max-w-3xl">
            <h2 className="text-3xl font-bold font-montserrat">
              Your Personalized Plan
            </h2>
            <p className="text-lg font-mono">Score: {result.score}/5</p>
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-2xl font-bold text-gray-50" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-xl font-playfair font-semibold text-gray-50"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-lg font-semibold text-gray-50"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p className="text-gray-50 font-lato" {...props} />
                ),
                li: ({ ...props }) => (
                  <li
                    className="ml-6 list-disc text-gray-50 font-lato"
                    {...props}
                  />
                ),
                pre: ({ ...props }) => (
                  <pre className="ml-6 text-gray-50 font-lato" {...props} />
                ),
              }}
            >
              {result.plan}
            </ReactMarkdown>

            <button
              onClick={() => {
                setStep("input");
                setMonths("1");
                setHours("2");
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
