import React, { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { courseService } from '../services/courseService'
import Navbar from "../components/Navbar";
import Header from "../components/Header";

// API functions
const api = axios.create({
  baseURL: "http://localhost:5000/interview",
  headers: { "Content-Type": "application/json" },
});

const initQuiz = async (course) => {
  const response = await api.post("/init-interview", { course });
  const question = response.data.question;

  // Convert the question text into audio and play it
  playAudio(question);

  return response.data;
};

const playAudio = (text) => {
  if ('speechSynthesis' in window) {
    // Create an instance of SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    // Optionally set properties like voice, rate, pitch
    utterance.rate = 1; // Speed of the speech
    utterance.pitch = 1; // Pitch of the speech
    utterance.volume = 1; // Volume of the speech

    // Speak the text
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Speech synthesis is not supported in this browser.');
  }
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

// Record user voice and transcribe it to text
const recordAndTranscribeAudio = () => {
  return new Promise((resolve, reject) => {
    // Check browser support for media devices and Web Speech API
    if (!navigator.mediaDevices || !window.SpeechRecognition && !window.webkitSpeechRecognition) {
      reject(new Error('MediaRecorder or SpeechRecognition API is not supported.'));
      return;
    }

    // Set up SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US'; // Set language
    recognition.interimResults = false; // Only send finalized transcriptions
    recognition.maxAlternatives = 1; // Use the top alternative

    const constraints = { audio: true }; // For audio input

    // Access the microphone
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);

      // When `start` is called, start Web Speech API transcription
      mediaRecorder.start();
      console.log('Recording started. Speak now...');

      // Start listening for audio
      recognition.start();

      recognition.onresult = (event) => {
        // Get the transcript from the SpeechRecognition results
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);

        resolve(transcript);

        // Stop media recorder and transcription
        mediaRecorder.stop();
        recognition.stop();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        reject(event.error);

        // Stop both the recorder and transcription on error
        mediaRecorder.stop();
        recognition.stop();
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended.');
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped.');
        stream.getTracks().forEach((track) => track.stop()); // Stop microphone access
      };
    }).catch((error) => {
      console.error('Error accessing user media:', error);
      reject(error);
    });
  });
};

const generateReport = async (interactionHistory) => {
  const response = await api.post("/generate-report", {
    interaction_history: interactionHistory,
  });
  return response.data;
};


const Interview = () => {
  const { courseId } = useParams();
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingStop, setLoadingStop] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // Status of the recording
  const [recordedText, setRecordedText] = useState(""); // Transcribed text result

  const [userSpeaking, setUserSpeaking] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)


  const answerInputRef = useRef();
  const summaryRef = useRef();

  const [course, setCourse] = useState("");
  const [quizState, setQuizState] = useState({
    status: "idle", // 'idle', 'question', 'report-ready', 'report'
    summary: "",
    questions: [],
    currentQuestion: "",
    interactionHistory: [],
    feedback: "",
    report: "",
  });

  useEffect(() => {
  const fetchCourse = async () => {
    try {
      const response = await courseService.getCourseById(courseId);
        console.log(response);
        
      if (!response || !response.course) {
        setError("Course not found");
        setLoading(false);
        return;
      }

      const result = {
        course_title: response.course.title,
        topics_title: response.course.topics.map(topic => topic.title).join('\n'),
      };

      setCourse(result.topics_title);
      console.log(course);
    } catch (error) {
      setError("Failed to fetch course");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchCourse();
}, [courseId]);

  const handleInitQuiz = async () => {
    setLoadingStart(true);
    setAiSpeaking(true);
    try {
      const result = await initQuiz(course);
      console.log(result);
      
      const selected = await selectQuestion(result.questions);
      console.log(selected);

      // Play the audio of the first question
      playAudio(selected.current_question);
      setQuizState({
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

  const handleSubmitAnswer = async () => {
  setLoadingSubmit(true);
  if (!recordedText) return alert("Please record an answer first.");
  
  try {
    const result = await submitAnswer(
      quizState.currentQuestion,
      recordedText, // Use recorded text instead of textarea answer
      quizState.interactionHistory
    );
    console.log(result);
    
    setQuizState((prev) => ({
      ...prev,
      interactionHistory: result.interaction_history,
      feedback: result.feedback,
      status:
        quizState.questions.length > 0 ? "question" : "report-ready",
    }));

    setRecordedText(""); // Clear the recorded answer after submission
  } catch (error) {
    console.error("Failed to submit answer:", error);
  } finally {
    setLoadingSubmit(false);
  }
};

  const handleNextQuestion = async () => {
    setLoadingNext(true);
    setAiSpeaking(true);
    try {
      const selected = await selectQuestion(quizState.questions);
      console.log(selected);

      // Play the audio of the first question
      playAudio(selected.current_question);

      setQuizState((prev) => ({
        ...prev,
        currentQuestion: selected.current_question,
        questions: selected.updated_list,
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
      console.log(result);
      
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

const handleRecordAnswer = async () => {
  setIsRecording(true); // Set recording status to true
  setUserSpeaking(true); // Set user speaking status to true
  setAiSpeaking(false); // Set AI speaking status to false
  try {
    const transcript = await recordAndTranscribeAudio(); // Start recording and transcription
    setRecordedText(transcript); // Set the transcribed text
    console.log("Transcribed answer:", transcript);
  } catch (error) {
    console.error("Recording or transcription failed:", error);
    alert("Something went wrong while recording. Please try again.");
  } finally {
    setIsRecording(false); // Reset recording status
    setUserSpeaking(false); // Reset user speaking status
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


  return (
    <div className="bg-gradient-to-b from-slate-950 to-slate-900 min-h-screen text-white font-ubuntu pb-20">
      <Header />
      <div className="flex flex-col items-center py-5 px-4">
        <h2 className=" text-lg px-4 font-semibold mb-10 truncate max-w-md text-center bg-gray-800 bg-opacity-70 border border-gray-600 rounded-full py-3 shadow-sm tracking-wider">
          Live Mock Interview
        </h2>

        {/* {course && (
          <div className="bg-blue-900/30 px-4 py-2 rounded-lg text-center mb-8">
            <span className="font-medium">Course: </span>
            <span className="text-gray-300">{course.title}</span>
          </div>
        )} */}

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between relative min-h-[300px]">
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

          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between relative min-h-[300px]">
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

        {/* Start Quiz */}
        {quizState.status === "idle" && (
          <div className="z-20 flex flex-col items-center justify-center mt-5 gap-4 w-full max-w-2xl mb-10">
            <button
              onClick={handleInitQuiz}
              className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-600 font-semibold  text-white px-1 py-2 rounded-md  w-1/3"
              disabled={loadingStart} // Disable button while loadingStart
            >
              {loadingStart ? "Starting..." : "Start Interview"}
            </button>
          </div>
        )}

        {/* Quiz Section */}
        {(quizState.status === "question" ||
          quizState.status === "report-ready") && (
          <div className="z-20 flex flex-col items-center justify-center gap-4 w-full max-w-5xl space-y-4">
            

            <div className="mt-5 flex gap-4 font-ubuntu font-medium">
            {/* Record Button */}
            <button
            onClick={handleRecordAnswer}
            className={`bg-gradient-to-t from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-600 px-4 py-2 rounded-md font-semibold ${
            isRecording ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isRecording} // Disable "Record" button while recording
        >
            {isRecording ? "Recording..." : "Record Answer"}
            </button>

            
            {/* Submit Answer Button */}
            <button
            onClick={handleSubmitAnswer}
            className="bg-gradient-to-b from-green-400 to-green-700 hover:from-green-700 hover:to-green-600 px-4 py-2 duration-500 rounded-md cursor-pointer"
            disabled={loadingSubmit || !recordedText} // Disable if no transcription
        >
            {loadingSubmit ? "Submitting..." : "Submit Answer"}
            </button>

            {quizState.status === "report-ready" ? (
                <button
                onClick={handleStopQuiz}
                className="bg-gradient-to-t from-yellow-400 to-yellow-700 hover:from-yellow-700 hover:to-yellow-600 px-4 py-2 duration-500 rounded-md"
                disabled={loadingStop} // Disable button while loadingStop
                >
                {loadingStop ? "Generating..." : "Final Report"}
                </button>
            ) : (
                <button
                onClick={handleStopQuiz}
                className="bg-gradient-to-t from-red-400 to-red-700 hover:from-red-700 hover:to-red-600 px-4 py-2 duration-500 rounded-md"
                disabled={loadingStop} // Disable button while loadingStop
                >
                {loadingStop ? "Stopping..." : "Stop Quiz"}
                </button>
            )}
            </div>

            {/* Show Transcribed Answer */}
            {recordedText && (
            <div className="bg-blue-100 p-4 flex flex-col gap-3 rounded-md text-black w-full">
            <strong>Transcribed Answer:</strong>
            <p>{recordedText}</p>
            </div>
            )}

            {quizState.feedback && (
              <div className=" space-y-4">
                <h3 className="text-xl font-medium font-montserrat">
                  Feedback:
                </h3>
                <p className="bg-gradient-to-b from-blue-50 to-blue-200  text-black p-3 rounded-md font-lato">
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
                {quizState.feedback}
              </ReactMarkdown>
                  
                </p>

                {quizState.status === "question" && (
                  <button
                    onClick={handleNextQuestion}
                    className="mt-4 bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-600 px-4 py-2 duration-500 font-ubuntu font-medium rounded-md"
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
          <div className="z-20  w-full max-w-5xl mt-8 flex flex-col items-center justify-center gap-5 ">
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
              className=" bg-gradient-to-r from-green-400 to-green-700 hover:from-green-700 hover:to-green-600 text-white px-6 py-2 rounded-md font-ubuntu"
            >
              Download PDF
            </button>
          </div>
        )}

        <Navbar />
      </div>
    </div>
  );
};

export default Interview;