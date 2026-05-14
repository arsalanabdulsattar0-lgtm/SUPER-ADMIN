import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@invoiceflow.com');
  const [password, setPassword] = useState('password123');

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
              <span className="text-white font-bold text-3xl">I</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm font-medium">Log in to manage your professional invoices</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 mt-4"
            >
              Sign In to Flow
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account? <a href="#" className="text-white font-bold hover:text-indigo-400 transition-colors underline underline-offset-4 decoration-slate-700">Get Started</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
