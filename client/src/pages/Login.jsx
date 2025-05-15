import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {authService} from '../services/authService'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      console.log('Attempting login with:', { email });
      const response = await authService.login({ email, password });
      console.log('Login successful:', response);
      navigate('/')
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           'Failed to login. Check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8 sm:p-10 space-y-6">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-400 glow-text">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-400">Welcome back! Please enter your credentials.</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition glow-input"
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
              className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition glow-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition glow-button disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
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