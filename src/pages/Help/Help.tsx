import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Book, MessageCircle, FileQuestion, LifeBuoy } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight">How can we help?</h2>
          <p className="text-indigo-100 text-sm leading-relaxed mb-6">
            Search our knowledge base or get in touch with our support team. 
            We're here to help you manage your business efficiently.
          </p>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for articles..."
              className="w-full bg-white/20 border-none rounded-2xl py-4 px-6 text-white placeholder:text-indigo-200 focus:ring-2 focus:ring-white/30 backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[
          { title: 'Knowledge Base', icon: Book, color: 'text-blue-500' },
          { title: 'Live Chat', icon: MessageCircle, color: 'text-emerald-500' },
          { title: 'FAQs', icon: FileQuestion, color: 'text-amber-500' },
          { title: 'Contact Support', icon: LifeBuoy, color: 'text-purple-500' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4 cursor-pointer hover:shadow-xl transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto bg-slate-50 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          Popular Articles
        </h3>
        <div className="space-y-4">
          {[
            'How to create your first invoice',
            'Setting up recurring payments',
            'Customizing your invoice templates',
            'Managing multiple client profiles',
          ].map((text, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
              <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">{text}</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
