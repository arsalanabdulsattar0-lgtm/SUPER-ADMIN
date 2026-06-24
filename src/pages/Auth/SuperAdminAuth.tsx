import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  onLogin: () => void;
}

export const SuperAdminAuth: React.FC<Props> = ({ onLogin }) => {
  const { brand } = useTheme();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, perform actual auth logic here.
    // For now, we just log the user in successfully.
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 bg-white shadow-[20px_0_40px_-15px_rgba(0,0,0,0.05)]">
        
        <div className="max-w-[360px] w-full mx-auto">
          {/* Logo / Brand Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Super Admin</h1>
              <p className="text-sm font-medium text-slate-500">Control Panel</p>
            </div>
          </motion.div>

          {/* Form Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back
            </h2>
            <p className="text-slate-500">
              Enter your credentials to access the dashboard.
            </p>
          </motion.div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              icon={Mail} 
              placeholder="admin@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="lg"
            />
            
            <div className="space-y-1">
              <Input 
                label="Password" 
                type="password" 
                icon={Lock} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
              />
              <div className="flex justify-end pt-1">
                <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-12 mt-4 text-[15px] font-semibold rounded-2xl shadow-lg shadow-blue-500/25"
            >
              <div className="flex items-center justify-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </div>
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Branding/Features Graphic */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900 items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        
        {/* Abstract Graphic / Content */}
        <div className="relative z-10 max-w-lg p-12 text-center text-white">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full aspect-square rounded-2xl bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 backdrop-blur-sm p-8 shadow-2xl flex flex-col items-center justify-center"
          >
            <ShieldCheck className="w-32 h-32 text-blue-400 mb-8 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Enterprise Scale Control</h2>
            <p className="text-lg text-slate-300">
              Manage multi-tenant architectures, configure deep-level permissions, and oversee the entire SaaS ecosystem from a unified command center.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAuth;
