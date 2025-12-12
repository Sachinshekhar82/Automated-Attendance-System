import React, { useState } from 'react';
import { School, ArrowRight, Loader2, KeyRound, Mail, Lock, CheckCircle, RefreshCcw } from 'lucide-react';
import { getStoredCredentials, updateCredentials } from '../services/storage';

type LoginState = 'LOGIN' | 'FORGOT' | 'RESET_SUCCESS';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [view, setView] = useState<LoginState>('LOGIN');
  const [loading, setLoading] = useState(false);
  
  // Login Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset Inputs
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const creds = getStoredCredentials();

    setTimeout(() => {
      if (username === creds.username && password === creds.password) {
        onLogin();
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 1000);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      updateCredentials(newPassword);
      setLoading(false);
      setView('RESET_SUCCESS');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/20">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300">
            <School className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gramin Shiksha</h1>
          <p className="text-slate-500 mt-2 font-medium">Smart Attendance System</p>
        </div>

        {view === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">USERNAME</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">PASSWORD</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Login <ArrowRight className="w-6 h-6" /></>}
            </button>
            
            <button 
              type="button" 
              onClick={() => setView('FORGOT')}
              className="w-full text-indigo-600 font-bold text-sm hover:underline"
            >
              Forgot Password?
            </button>
          </form>
        )}

        {view === 'FORGOT' && (
          <form onSubmit={handleReset} className="space-y-5 animate-fade-in">
             <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Reset Password</h3>
                <p className="text-sm text-slate-500">Verify your details to create a new password.</p>
             </div>
             
             <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">RECOVERY EMAIL</label>
               <input 
                  type="email" 
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none font-medium"
                />
             </div>

             <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">NEW PASSWORD</label>
               <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New strong password"
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none font-medium"
                />
             </div>

             <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><RefreshCcw className="w-5 h-5" /> Reset Password</>}
            </button>

             <button 
              type="button" 
              onClick={() => setView('LOGIN')}
              className="w-full text-slate-400 font-bold text-sm hover:text-slate-600"
            >
              Back to Login
            </button>
          </form>
        )}

        {view === 'RESET_SUCCESS' && (
          <div className="text-center py-8 animate-fade-in">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Password Updated!</h3>
             <p className="text-slate-500 mb-8">You can now login with your new credentials.</p>
             <button 
              onClick={() => setView('LOGIN')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
