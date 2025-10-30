import React, { useState } from 'react';
import Snowfall from './Snowfall';

interface LoginPageProps {
  onLogin: (username: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError('User code cannot be empty.');
      return;
    }

    setIsLoggingIn(true);
    try {
      await onLogin(trimmedUsername);
      // On success, the App component will re-render, and this component will unmount.
    } catch (err) {
      setError('Invalid code. Please try again.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden relative">
      <Snowfall />
      <div className="w-full max-w-sm p-8 space-y-8 bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-2xl z-10">
        <div className="text-center">
           <div className="relative inline-block mb-4">
             <svg width="40" height="25" viewBox="0 0 160 100" className="absolute -top-6 -right-8 transform -rotate-12 z-10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M158 99C158 99 157.163 43.1979 119.5 40C81.8373 36.8021 78.5 73.5 78.5 73.5C78.5 73.5 81.3373 35.8021 44.5 33C7.66268 30.1979 1 99 1 99L158 99Z" fill="#DC2626"/>
                <path d="M158 99C158 99 157.163 43.1979 119.5 40C81.8373 36.8021 78.5 73.5 78.5 73.5L1 99L158 99Z" stroke="black" strokeOpacity="0.2"/>
                <circle cx="119.5" cy="21.5" r="21.5" fill="white"/>
                <circle cx="119.5" cy="21.5" r="21.5" stroke="black" strokeOpacity="0.2"/>
             </svg>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Kinettix<span className="text-red-400">Poll</span>
            </h1>
          </div>
          <p className="mt-2 text-gray-400">Please enter your Kinettix Code</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="mt-1">
              <input
                id="username-input"
                name="Kinettix Code"
                type="text"
                autoComplete="User code"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Kinettix Code"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center -my-2">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors disabled:bg-red-800 disabled:cursor-wait"
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
