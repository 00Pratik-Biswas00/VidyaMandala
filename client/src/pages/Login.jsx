import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Logging in with', email, password)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8 sm:p-10 space-y-6">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-400 glow-text">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-400">Welcome back! Please enter your credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition glow-input"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition glow-input"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition glow-button"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-blue-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
