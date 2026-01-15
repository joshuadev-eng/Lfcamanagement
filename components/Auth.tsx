
import React, { useState } from 'react';
import { authService } from '../services/authService';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        await authService.login(email, password);
      } else if (mode === 'signup') {
        await authService.signup(email, password, name);
        setSuccessMessage('Account created! Please check your email for a confirmation link before logging in.');
        setMode('login');
      } else {
        await authService.resetPassword(email);
        setSuccessMessage('Check your email for reset instructions.');
        setMode('login');
      }
    } catch (err: any) {
      // Display the actual error message from Supabase
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-red-600 p-4">
      <div className="bg-white/95 backdrop-blur-lg w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-white overflow-hidden">
            <img 
                src="https://i.ibb.co/LzN230M/lfca-logo.png" 
                alt="LFCA Logo" 
                className="w-full h-full object-contain p-1"
                onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=LFCA&background=1e40af&color=fff'; }}
            />
          </div>
          <h1 className="text-2xl font-black text-gray-900 text-center tracking-tight leading-tight">Living Faith Champions' Assembly</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Church Management Portal 🇱🇷</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-sm font-bold mb-6 text-center animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-800 shadow-inner"
                placeholder="Abraham Kollie"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-800 shadow-inner"
              placeholder="pastor@lfca-liberia.org"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Password</label>
              <input 
                type="password" 
                required 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-800 shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white p-4 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center space-x-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>
              {loading ? 'Processing...' : 
               mode === 'login' ? 'Sign In' : 
               mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          {mode === 'login' && (
            <>
              <button onClick={() => { setMode('reset'); setError(''); setSuccessMessage(''); }} className="text-sm font-bold text-gray-400 hover:text-blue-800 block w-full transition-colors">Forgot Password?</button>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-400 mb-2">New to LFCA Manager?</p>
                <button onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }} className="text-blue-800 font-black hover:underline transition-all">Register Your Account</button>
              </div>
            </>
          )}
          {mode !== 'login' && (
            <button onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }} className="text-sm font-bold text-blue-800 hover:underline transition-all">Return to Login</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
