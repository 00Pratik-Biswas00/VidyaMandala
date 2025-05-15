import React, { useState } from 'react'
import Header from '../components/Header'
import { PhoneMissed } from 'lucide-react'

function Interview() {
  const [userSpeaking, setUserSpeaking] = useState(true)
  const [aiSpeaking, setAiSpeaking] = useState(true)

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
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white font-ubuntu">
      <Header />
      <div className="flex flex-col items-center py-10 px-4">
        <h2 className=" text-gray-300 truncate max-w-md text-center  bg-gray-800 bg-opacity-70 border border-gray-600 rounded-full text-lg px-4 py-1 shadow-sm tracking-wide mb-10">Live Interview  </h2>

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
              setUserSpeaking(false)
              setAiSpeaking(true)
            }}
          >
            Next Question
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
            onClick={() => {
              setUserSpeaking(false)
              setAiSpeaking(false)
            }}
          >
            <PhoneMissed/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Interview
