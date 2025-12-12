import React, { useState } from 'react';
import { School, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin(); // Auto login for demo
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
          <School className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Gramin Shiksha</h1>
        <p className="text-slate-500 mb-8">Automated Attendance System</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input disabled type="text" value="admin" className="w-full p-3 border rounded-xl bg-slate-50 text-slate-500" />
          <input disabled type="password" value="********" className="w-full p-3 border rounded-xl bg-slate-50 text-slate-500" />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-4">Demo Access Enabled</p>
      </div>
    </div>
  );
};

export default Login;
