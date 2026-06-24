import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { Building2, Package, TrendingUp, Activity, Box, CheckCircle2, ChevronDown, DollarSign } from 'lucide-react';

const statsData = [
  { name: 'Jan', companies: 400 },
  { name: 'Feb', companies: 800 },
  { name: 'Mar', companies: 600 },
  { name: 'Apr', companies: 1200 },
  { name: 'May', companies: 1800 },
  { name: 'Jun', companies: 1400 },
  { name: 'Jul', companies: 2400 },
];

const packageData = [
  { name: 'Basic', value: 400, color: '#3b82f6' },     // blue-500
  { name: 'Standard', value: 800, color: '#8b5cf6' },  // violet-500
  { name: 'Enterprise', value: 300, color: '#10b981' },// emerald-500
];

export default function OverviewDashboard() {
  const { brand } = useTheme();
  const [chartType, setChartType] = useState('line');
  const [timeframe, setTimeframe] = useState('6M');
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);

  const chartOptions = [
    { id: 'area', label: 'Area Chart' },
    { id: 'bar', label: 'Bar Chart' },
    { id: 'line', label: 'Line Chart' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">System Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Monitor all companies and subscription metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Total Companies */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
              <Building2 className="w-5 h-5 text-blue-500" />
              <span>Total Companies</span>
            </div>
          </div>
          <div className="mt-0.5">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">1,245</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12.5%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
          {/* Decorative background blur */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
        </div>

        {/* Active Packages */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
              <Package className="w-5 h-5 text-violet-500" />
              <span>Active Subscriptions</span>
            </div>
          </div>
          <div className="mt-0.5">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">1,180</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +8.2%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-500"></div>
        </div>

        {/* Monthly Revenue */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>Monthly Revenue</span>
            </div>
          </div>
          <div className="mt-0.5">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">$45,200</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +15.3%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
        </div>

        {/* Statistics Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Activity className="w-5 h-5 text-indigo-500" />
              <span>Growth Statistics</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                {['1W', '1M', '6M', '1Y'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${timeframe === t ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none transition-colors border border-slate-200/50"
                >
                  {chartOptions.find(opt => opt.id === chartType)?.label}
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
                
                {isChartDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-10 py-1">
                    {chartOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setChartType(opt.id);
                          setIsChartDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          chartType === opt.id 
                            ? 'bg-blue-600 text-white font-medium' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={statsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={brand.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={brand.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="companies" stroke={brand.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorCompanies)" />
                </AreaChart>
              ) : chartType === 'bar' ? (
                <BarChart data={statsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Bar dataKey="companies" fill={brand.primary} radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              ) : (
                <LineChart data={statsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="companies" stroke={brand.primary} strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: brand.primary }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Billing / Package Distribution Donut */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Package className="w-5 h-5 text-fuchsia-500" />
              <span>Package Distribution</span>
            </div>
          </div>
          <div className="flex-grow flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={packageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {packageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">1.5k</span>
              <span className="text-xs text-gray-400">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {packageData.map((pkg, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pkg.color }}></div>
                <div>
                  <div className="text-xs text-gray-500">{pkg.name}</div>
                  <div className="font-semibold text-gray-800">{pkg.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience / Module Usage */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Box className="w-5 h-5 text-orange-500" />
              <span>Module Usage</span>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-md">Across all companies</span>
          </div>
          
          <div className="space-y-6 mt-4">
            {[
              { name: 'Sales Module', percent: 92, color: 'bg-blue-500' },
              { name: 'Inventory Module', percent: 85, color: 'bg-violet-500' },
              { name: 'Purchases Module', percent: 78, color: 'bg-emerald-500' },
              { name: 'Business Partners', percent: 95, color: 'bg-amber-500' }
            ].map((mod, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{mod.name}</span>
                  <span className="font-bold text-gray-900">{mod.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${mod.percent}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-2.5 rounded-full ${mod.color}`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AC Overview / Recent Activity */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-rose-500" />
              <span>Recent Activity</span>
            </div>
          </div>
          
          <div className="space-y-5 flex-grow">
            {[
              { title: 'New Company Registered', desc: 'TechCorp Inc. joined Standard Plan', time: '2m ago' },
              { title: 'Package Upgraded', desc: 'Alpha Traders upgraded to Enterprise', time: '1h ago' },
              { title: 'Module Overridden', desc: 'Admin enabled Sales for Beta Ltd.', time: '3h ago' },
              { title: 'New Company Registered', desc: 'Mega Mart joined Basic Plan', time: '5h ago' },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-rose-500 flex-shrink-0"></div>
                <div className="flex-grow">
                  <div className="text-sm font-bold text-gray-800">{act.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{act.desc}</div>
                </div>
                <div className="text-xs font-medium text-gray-400 flex-shrink-0">{act.time}</div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors">
            View All Activity
          </button>
        </div>

      </div>
    </div>
  );
};


