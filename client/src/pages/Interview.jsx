import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { PhoneMissed } from 'lucide-react'
import { courseService } from '../services/courseService'
import { authService } from '../services/authService'
import { enrollmentService } from '../services/enrollmentService'
import axios from 'axios'


const api = axios.create({
  baseURL: "http://localhost:5000/interview",
  headers: { "Content-Type": "application/json" },
});

const initInterview = async (course) => {
  const response = await api.post("/init-interview", { course });
  return response.data;
};

const selectQuestion = async (questions) => {
  const response = await api.post("/select-question", { questions });
  return response.data;
};

const submitAnswer = async (question, answer, history) => {
  const response = await api.post("/submit-answer", {
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


function Interview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [userSpeaking, setUserSpeaking] = useState(true)
  const [aiSpeaking, setAiSpeaking] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [course, setCourse] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const [MockState, setMockState] = useState({
      status: "idle", // 'idle', 'question', 'report'
      questions: [],
      currentQuestion: "",
      interactionHistory: [],
      feedback: "",
      report: "",
    });
  
  const handleInitMock = async () => {
    setLoadingStart(true);
    try {
      const result = await initInterview(course);
      const selected = await selectQuestion(result.questions);

      setMockState({
        status: "question",
        questions: selected.updated_list,
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

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        if (!courseId) {
          setError("Course ID is missing");
          setLoading(false);
          return;
        }
        
        // Check if user is logged in
        if (!authService.isLoggedIn()) {
          navigate("/login");
          return;
        }
        
        // Fetch the course data
        const response = await courseService.getCourseById(courseId);
        if (!response || !response.course) {
          setError("Course not found");
          setLoading(false);
          return;
        }
        const result = {
            'course_title': response.course.title,
            'topics_title': response.course.topics.map(topic => topic.title).join('\n')
        };
        console.log(result);
        
        setCourse(result.topics_title);
        
        // Check enrollment status
        const enrolled = await enrollmentService.checkEnrollmentStatus(courseId);
        setIsEnrolled(enrolled);
        
        if (!enrolled) {
          setError("You need to be enrolled in this course to access the mock interview");
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading course data:", err);
        setError("Failed to load course data. Please try again.");
        setLoading(false);
      }
    };
    
    loadCourseData();
    handleInitMock();
  }, [courseId, navigate]);

  const handleSubmitAnswer = async () => {
    setLoadingSubmit(true);
    const answer = answerInputRef.current?.value;
    if (!answer) return alert("Please write an answer.");

    try {
      const result = await submitAnswer(
        MockState.currentQuestion,
        answer,
        MockState.interactionHistory
      );

      setMockState((prev) => ({
        ...prev,
        interactionHistory: result.interaction_history,
        feedback: result.feedback,
        status:
          MockState.questions.length > 0 ? "question" : "report-ready",
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
      const selected = await selectQuestion(MockState.questions);
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: selected.current_question,
        question: selected.updated_list,
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
      const result = await generateReport(MockState.interactionHistory);
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

  const renderWave = (color) => {
    const bgColor = color === 'blue' ? 'bg-blue-400' : 'bg-green-400'

    return (
      <div className="flex space-x-1 h-6 items-end">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full ${bgColor} animate-wave`}
            style={{
              animationDelay: `${i * 0.1}s`,
              height: '1rem',
            }}
          />
        ))}
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4">Loading interview session...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p className="mb-6">{error}</p>
            <button 
              onClick={() => navigate(`/details/${course?.title || ""}`)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white font-ubuntu">
      <Header />
      <div className="flex flex-col items-center py-10 px-4">
        <h2 className="text-gray-300 truncate max-w-md text-center bg-gray-800 bg-opacity-70 border border-gray-600 rounded-full text-lg px-4 py-1 shadow-sm tracking-wide mb-4">
          Live Mock Interview
        </h2>
        
        {course && (
          <div className="bg-blue-900/30 px-4 py-2 rounded-lg text-center mb-8">
            <span className="font-medium">Course: </span>
            <span className="text-gray-300">{course.title}</span>
          </div>
        )}

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-gray-700 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between relative min-h-[300px]">
            <div className="relative mb-4 mt-10">
              {userSpeaking && (
                <span className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ripple" />
              )}
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold relative z-10">
                U
              </div>
            </div>
            <p className="text-lg font-semibold mb-10">You (Candidate)</p>

          
            {userSpeaking && (
              <div className="absolute bottom-6">{renderWave('blue')}</div>
            )}
          </div>

          <div className="bg-gray-700 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between relative min-h-[300px]">
            <div className="relative mb-4 mt-10">
              {aiSpeaking && (
                <span className="absolute inset-0 rounded-full border-4 border-green-400 animate-ripple" />
              )}
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-3xl font-bold relative z-10">
                🤖
              </div>
            </div>
            <p className="text-lg font-semibold mb-10">AI Interviewer</p>

        
            {aiSpeaking && (
              <div className="absolute bottom-6">{renderWave('green')}</div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <button
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition"
            onClick={() => {
              handleSubmitAnswer()
              setUserSpeaking(false)
              setAiSpeaking(true)
            }}
          >
            Next Question
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
            onClick={() => navigate(`/details/${course?.title || ""}`)}
          >
            <PhoneMissed className="mr-2 inline" /> End Interview
          </button>
        </div>
      </div>
    </div>
  )
}

export default Interview