import React, { useState, useEffect } from 'react';
import { School, Lock, User, ArrowRight, Loader2, Key, RefreshCw, ChevronLeft, CheckCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Reset Password State
  const [isResetMode, setIsResetMode] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Initialize Default Credentials if not present
  useEffect(() => {
    const storedCreds = localStorage.getItem('gramin_creds');
    if (!storedCreds) {
      localStorage.setItem('gramin_creds', JSON.stringify({ u: 'admin', p: 'admin123' }));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const storedCreds = JSON.parse(localStorage.getItem('gramin_creds') || '{}');
      
      if (username === storedCreds.u && password === storedCreds.p) {
        onLogin();
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 800);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      // Simulate checking a master key (e.g., provided by the district admin)
      if (masterKey.toLowerCase() === 'school') {
        localStorage.setItem('gramin_creds', JSON.stringify({ u: newUsername, p: newPassword }));
        setSuccess('Credentials updated successfully!');
        
        // Auto-switch back to login after success
        setTimeout(() => {
          setIsResetMode(false);
          setSuccess('');
          setMasterKey('');
          setNewUsername('');
          setNewPassword('');
          setLoading(false);
        }, 1500);
      } else {
        setError('Invalid Master Key. Contact Administrator.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-blue-700 p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <School className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Gramin Shiksha</h1>
            <p className="text-blue-100 text-sm mt-1">Automated Attendance System</p>
          </div>
          
          {/* Decorative Circle */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
             <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-400 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          
          {/* LOGIN MODE */}
          {!isResetMode ? (
            <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setIsResetMode(true); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-400">
                  Initial credentials: admin
                </p>
              </div>
            </form>
          ) : (
            /* RESET MODE */
            <form onSubmit={handleReset} className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold border-b border-slate-100 pb-2">
                 <button 
                   type="button" 
                   onClick={() => { setError(''); setSuccess(''); setIsResetMode(false); }}
                   className="p-1 hover:bg-slate-100 rounded-full mr-1"
                 >
                   <ChevronLeft className="w-5 h-5" />
                 </button>
                 Reset Credentials
              </div>

              {success ? (
                 <div className="bg-green-50 text-green-700 p-4 rounded-xl flex flex-col items-center justify-center text-center py-8">
                    <CheckCircle className="w-10 h-10 mb-2" />
                    <p className="font-bold">{success}</p>
                    <p className="text-xs mt-1">Redirecting to login...</p>
                 </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Authorization</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="password" 
                        value={masterKey}
                        onChange={(e) => setMasterKey(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Master Key (hint: school)"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Details</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="New Username"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="New Password"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center justify-center text-center">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Reset & Update
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;