import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Invalid email or password';
      
      if (err instanceof Error) {
        if (err.message.includes('Unable to connect to server')) {
          errorMessage = err.message;
        } else if (err.message.includes('Network Error') || err.message.includes('ERR_NETWORK')) {
          errorMessage = 'Unable to connect to server. Please ensure the backend is running and try accessing via HTTP: http://localhost:5173';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isNetworkError = error.includes('Unable to connect to server') || error.includes('backend is running');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        <div className="backdrop-blur-md bg-glass-white rounded-2xl shadow-medical-lg border border-white/30 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-2xl flex items-center justify-center mb-4 shadow-medical">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to HealthCare AI</h1>
            <p className="text-gray-600">Your community health assistant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-primary/30 focus:border-medical-primary transition-colors backdrop-blur-sm"
                  placeholder="patient@community.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-primary/30 focus:border-medical-primary transition-colors backdrop-blur-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg text-sm ${
                  isNetworkError 
                    ? 'bg-amber-50 border border-amber-200 text-amber-800' 
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}
              >
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium mb-1">
                      {isNetworkError ? 'Connection Error' : 'Login Failed'}
                    </div>
                    <div>{error}</div>
                    {isNetworkError && (
                      <div className="mt-2 text-xs">
                        <strong>Troubleshooting:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Ensure the backend server is running</li>
                          <li>Try accessing via HTTP: <a href="http://localhost:5173" className="underline">http://localhost:5173</a></li>
                          <li>Check that the backend is running on port 3001</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-medical-primary to-medical-secondary text-white py-3 px-4 rounded-xl font-medium hover:shadow-medical transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo access: Use any email and password
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;