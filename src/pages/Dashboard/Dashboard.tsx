import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  DollarSign
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Revenue', value: '$124,500', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12.5%' },
    { label: 'Pending Invoices', value: '18', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '5 overdue' },
    { label: 'Paid Invoices', value: '142', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8%' },
    { label: 'Average Pay Time', value: '4.2 Days', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: '-1.2 days' },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
        <p className="text-slate-500 text-sm">Welcome back, John! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5, rotateX: 2, rotateY: 2 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group cursor-default"
            style={{ perspective: '1000px' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-80 flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-transparent" />
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">Revenue Analytics Chart</p>
            <p className="text-xs text-slate-300 mt-1">Integration in progress...</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-80">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Invoice #INV-4521</p>
                  <p className="text-xs text-slate-400">Paid by Acme Corp &bull; 2h ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default Dashboard;
