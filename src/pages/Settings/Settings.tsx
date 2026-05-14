import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Palette, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  const sections = [
    { title: 'Profile Settings', desc: 'Manage your public profile and avatar.', icon: User },
    { title: 'Notifications', desc: 'Configure how you receive alerts.', icon: Bell },
    { title: 'Security', desc: 'Update password and 2FA settings.', icon: Shield },
    { title: 'Billing & Plans', desc: 'Manage your subscription and payment methods.', icon: CreditCard },
    { title: 'Appearance', desc: 'Customize the look and feel of the app.', icon: Palette },
    { title: 'Regional & Language', desc: 'Set your preferred currency and time zone.', icon: Globe },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-400 text-xs mt-1">Configure your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <section.icon className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{section.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{section.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
