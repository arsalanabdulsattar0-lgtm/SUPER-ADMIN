import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Download, SlidersHorizontal, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

import { Button } from '../../../components/ui/Button';

interface InvoiceItem {
  id: string; customer: string; customerInitials: string; customerColor: string;
  issueDate: string; dueDate: string; amount: string; rawAmount: number;
  status: 'Draft' | 'Paid' | 'Pending' | 'Overdue'; payment: string; type: string;
}
interface Dashboard2Props { invoiceItems?: InvoiceItem[]; onViewChange?: (view: string) => void; }

const fmt  = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmt2 = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COUNTRIES = [
  { name: 'USA',       flag: '🇺🇸', color: '#3b82f6', pct: 27 },
  { name: 'Australia', flag: '🇦🇺', color: '#22c55e', pct: 15 },
  { name: 'Italy',     flag: '🇮🇹', color: '#ef4444', pct: 15 },
  { name: 'Germany',   flag: '🇩🇪', color: '#f59e0b', pct: 12 },
  { name: 'Canada',    flag: '🇨🇦', color: '#8b5cf6', pct: 10 },
];

export default function Dashboard2({ invoiceItems, onViewChange }: Dashboard2Props) {


  /* ── load data ── */
  const inv = useMemo(() => {
    const raw = invoiceItems && invoiceItems.length > 0
      ? invoiceItems
      : (() => { try { const s = localStorage.getItem('invoice_list'); if (s) return JSON.parse(s); } catch {} return []; })();
    return raw.map((i: any) => ({ ...i, customer: i.customer || i.client || 'Unknown', customerColor: i.customerColor || i.clientColor || '#16a34a' }));
  }, [invoiceItems]);

  const s = (arr: InvoiceItem[]) => arr.reduce((a, i) => a + (i.rawAmount || 0), 0);
  const paid  = useMemo(() => inv.filter((i: InvoiceItem) => i.status === 'Paid'),    [inv]);
  const pend  = useMemo(() => inv.filter((i: InvoiceItem) => i.status === 'Pending'), [inv]);
  const ovd   = useMemo(() => inv.filter((i: InvoiceItem) => i.status === 'Overdue'), [inv]);

  const paidSum  = useMemo(() => s(paid), [paid]);
  const pendSum  = useMemo(() => s(pend), [pend]);
  const ovdSum   = useMemo(() => s(ovd),  [ovd]);
  const total    = useMemo(() => s(inv),  [inv]);
  const avgVal   = useMemo(() => inv.length > 0 ? total / inv.length : 0, [inv, total]);

  const hasData = inv.length > 0;
  const dPaid  = hasData ? paidSum  : 14813;
  const dPend  = hasData ? pendSum  : 122380;
  const dOvd   = hasData ? ovdSum   : 98100;
  const dTotal = hasData ? total    : 155120;
  const dAvg   = hasData ? avgVal   : 2780;

  const dTotalPct = dTotal > 0;
  const paidPct  = dTotalPct ? (dPaid  / dTotal) * 100 : 30;
  const pendPct  = dTotalPct ? (dPend  / dTotal) * 100 : 45;
  const ovdPct   = dTotalPct ? (dOvd   / dTotal) * 100 : 25;

  /* gauge 270° */
  const FULL = 238.76, GAUGE = 179.07;
  const paidArc = (paidPct / 100) * GAUGE;
  const pendArc = (pendPct / 100) * GAUGE;
  const ovdArc  = (ovdPct  / 100) * GAUGE;

  /* sparkline */
  const spark = useMemo(() => {
    const fb = [40,45,42,58,52,68,62,72,65,75,80,85];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((m, i) => {
      if (!hasData) return { m, v: fb[i] };
      const mo = inv.filter((x: InvoiceItem) => x.issueDate && parseInt(x.issueDate.split('-')[1],10)-1===i);
      return { m, v: mo.length > 0 ? mo.reduce((a: number, x: InvoiceItem) => a+(x.rawAmount||0),0)/mo.length : 0 };
    });
  }, [inv]);

  /* top customers */
  const topCust = useMemo(() => {
    const t: Record<string,{name:string;amount:number;color:string}> = {};
    inv.forEach((i: InvoiceItem) => {
      if (!t[i.customer]) t[i.customer] = { name: i.customer, amount: 0, color: i.customerColor || '#16a34a' };
      t[i.customer].amount += i.rawAmount || 0;
    });
    const sorted = Object.values(t).sort((a,b) => b.amount - a.amount);
    const list = sorted.length > 0 ? sorted.slice(0,5) : [
      { name:'Pisong Kepok',    amount: 2423.00, color:'#16a34a' },
      { name:'Helix Labs',      amount: 1840.00, color:'#2563eb' },
      { name:'Marrow & Co.',    amount: 1210.00, color:'#7c3aed' },
      { name:'Sable Foundry',   amount: 950.00, color:'#ea580c' },
      { name:'Quill Press',     amount: 820.00, color:'#0891b2' },
    ];
    const max = list[0].amount || 1;
    return list.map(c => ({ ...c, pct: Math.round((c.amount/max)*100) }));
  }, [inv]);

  /* recent invoices */
  const recent = useMemo(() => inv.length > 0 ? inv.slice(0,5) : [
    { id:'INV-2024', customer:'Northwind Studio', issueDate:'May 18, 2026', dueDate:'Jun 1, 2026',  rawAmount:4200, status:'Paid'    },
    { id:'INV-2023', customer:'Helix Labs',       issueDate:'May 15, 2026', dueDate:'May 30, 2026', rawAmount:3800, status:'Pending' },
    { id:'INV-2022', customer:'Marrow & Co.',     issueDate:'May 10, 2026', dueDate:'May 25, 2026', rawAmount:2100, status:'Overdue' },
    { id:'INV-2021', customer:'Sable Foundry',    issueDate:'May 5, 2026',  dueDate:'May 20, 2026', rawAmount:1890, status:'Paid'    },
    { id:'INV-2020', customer:'Quill Press',      issueDate:'Apr 28, 2026', dueDate:'May 13, 2026', rawAmount:1200, status:'Overdue' },
  ], [inv]);

  const badge: Record<string,{bg:string;color:string}> = {
    Paid:    {bg:'#dcfce7',color:'#15803d'},
    Pending: {bg:'#fef9c3',color:'#a16207'},
    Overdue: {bg:'#fee2e2',color:'#b91c1c'},
    Draft:   {bg:'#f1f5f9',color:'#64748b'},
  };

  /* bar data — rank-normalised */
  const barVals = [dPaid, dPend, dOvd, dTotal];
  const barSorted = [...barVals].sort((a,b) => a-b);
  const norm = (v: number) => { const r = barSorted.indexOf(v); return [0.40, 0.60, 0.80, 1.0][r] ?? 1; };
  const BAR_H = 130;
  const bars = [
    { label:'Profit',  val:dPaid,  h: norm(dPaid)*BAR_H,  color:'#84cc16', gradFrom:'#bef264', pct:'+68%' },
    { label:'Insight', val:dPend,  h: norm(dPend)*BAR_H,  color:'#93c5fd', gradFrom:'#eff6ff', pct:'+89%' },
    { label:'Sale',    val:dOvd,   h: norm(dOvd)*BAR_H,   color:'#2563eb', gradFrom:'#60a5fa', pct:'+99%' },
    { label:'Target',  val:dTotal, h: norm(dTotal)*BAR_H, color:'#94a3b8', gradFrom:'#cbd5e1', pct:'+89%' },
  ];

  /* shared card style using inset shadow — so quarter-circle notch covers border cleanly */
  const wCard = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: '#fff',
    borderRadius: 20,
    border: 'none',
    boxShadow: 'inset 0 0 0 1.5px #E2E8F0',
    position: 'relative',
    overflow: 'hidden',
    ...extra,
  });

  /* quarter-circle notch element */
  const Notch = ({ btnBg = '#fff', iconColor = '#64748b' }: { btnBg?: string; iconColor?: string }) => (
    <>
      {/* the page-bg quarter circle that cuts the corner */}
      <div style={{ position:'absolute', top:0, right:0, width:64, height:64, background:'#F4F7FD', borderBottomLeftRadius:'100%', zIndex:1 }} />
      {/* the small circle button sitting in the notch */}
      <div style={{ position:'absolute', top:10, right:10, width:34, height:34, borderRadius:'50%', background:btnBg, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2, border: '1.5px solid #E2E8F0' }}>
        <ArrowUpRight style={{ width:15, height:15, color: iconColor }} />
      </div>
    </>
  );

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", background:'#F4F7FD', minHeight:'100vh', padding:'20px 24px', color:'#0f172a' }}>

      {/* ── Header ── */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, margin:0, letterSpacing:'-0.5px' }}>Dashboard</h1>
          <p style={{ fontSize:12, color:'#94a3b8', margin:'4px 0 0', fontWeight:500 }}>Hero's your overview of your business sales.</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', background:'rgba(148,163,184,0.15)', padding:2, borderRadius:10, border:'1px solid rgba(148,163,184,0.2)' }}>
            {[{id:'dashboard',label:'Default'},{id:'dashboard1',label:'AI Insights'},{id:'dashboard2',label:'Business Overview'}].map(t => {
              const a = t.id === 'dashboard2';
              return (
                <button key={t.id} onClick={() => onViewChange?.(t.id)} style={{
                  padding:'5px 12px', borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer',
                  background: a?'#fff':'transparent', color: a?'#0f172a':'#64748b',
                  boxShadow: a?'0 1px 4px rgba(0,0,0,0.10)':'none', transition:'all 0.15s',
                }}>{t.label}</button>
              );
            })}
          </div>
          <Button variant="white" size="md" icon={Download}>Export</Button>
          <Button variant="white" size="md" icon={SlidersHorizontal}>Filter</Button>
        </div>
      </motion.div>

      {/* ── Row 1: 4 Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:16 }}>

        {/* Card 1 – Total Profit (Blue) */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
          style={{ background:'linear-gradient(135deg,#1e56e8 0%,#2563eb 60%,#1d4ed8 100%)', borderRadius:20, padding:'22px 22px 18px', height:152, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', boxShadow:'none' }}>
          {/* quarter-circle notch */}
          <div style={{ position:'absolute', top:0, right:0, width:64, height:64, background:'#F4F7FD', borderBottomLeftRadius:'100%', zIndex:1 }} />
          <div style={{ position:'absolute', top:10, right:10, width:34, height:34, borderRadius:'50%', background:'rgba(37,99,235,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2, border: '1.5px solid rgba(255,255,255,0.2)' }}>
            <ArrowUpRight style={{ width:15, height:15, color:'#fff' }} />
          </div>
          {/* decorative */}
          <div style={{ position:'absolute', bottom:-28, left:-28, width:100, height:100, borderRadius:'50%', border:'22px solid rgba(255,255,255,0.07)' }} />
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.80)', margin:0, letterSpacing:'0.2px' }}>Total Profit</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:9, marginTop:8 }}>
              <h3 style={{ fontSize:28, fontWeight:900, color:'#fff', margin:0, letterSpacing:'-1px', lineHeight:1 }}>${hasData ? fmt2(dPaid) : '14,813.10'}</h3>
              <span style={{ padding:'2px 7px', borderRadius:6, fontSize:9, fontWeight:800, background:'rgba(255,255,255,0.22)', color:'#fff' }}>+20%</span>
            </div>
          </div>
          <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0, fontWeight:500 }}>vs last month {hasData ? '$' + fmt2(dPaid * 0.71) : '$10,534.00'}</p>
        </motion.div>

        {/* Card 2 – Total Insight */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.10}}
          style={wCard({ height:152, padding:'22px 22px 18px', display:'flex', flexDirection:'column', justifyContent:'space-between' })}>
          <Notch />
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#94a3b8', margin:0 }}>Total Insight</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:9, marginTop:8 }}>
              <h3 style={{ fontSize:28, fontWeight:900, margin:0, letterSpacing:'-1px', lineHeight:1 }}>${hasData ? fmt(dPend) : '122,380'}</h3>
              <span style={{ padding:'2px 7px', borderRadius:6, fontSize:9, fontWeight:800, background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }}>+4.2%</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <TrendingUp style={{ width:11, height:11, color:'#16a34a' }} />
            <p style={{ fontSize:10, color:'#94a3b8', margin:0, fontWeight:500 }}>vs last month {hasData ? '$' + fmt2(dPend * 0.97) : '$119.53'}</p>
          </div>
        </motion.div>

        {/* Card 3 – Organic Sales */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
          style={wCard({ height:152, padding:'22px 22px 18px', display:'flex', flexDirection:'column', justifyContent:'space-between' })}>
          <Notch />
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#94a3b8', margin:0 }}>Organic Sales</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:9, marginTop:8 }}>
              <h3 style={{ fontSize:28, fontWeight:900, margin:0, letterSpacing:'-1px', lineHeight:1 }}>
                {hasData ? (dOvd >= 1000000 ? '$' + (dOvd/1000000).toFixed(1) + 'M' : '$' + (dOvd/1000).toFixed(1) + 'K') : '$98.1M'}
              </h3>
              <span style={{ padding:'2px 7px', borderRadius:6, fontSize:9, fontWeight:800, background:'#fff1f2', color:'#e11d48', border:'1px solid #fecdd3' }}>-2.5%</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <TrendingDown style={{ width:11, height:11, color:'#e11d48' }} />
            <p style={{ fontSize:10, color:'#94a3b8', margin:0, fontWeight:500 }}>vs last month {hasData ? '$' + (dOvd * 0.028 / 1000).toFixed(1) + 'K' : '$2.8M'}</p>
          </div>
        </motion.div>

        {/* Card 4 – Gross Margin + sparkline */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.20}}
          style={wCard({ height:152, padding:'22px 22px 0', display:'flex', flexDirection:'column', justifyContent:'space-between' })}>
          <Notch />
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#94a3b8', margin:0 }}>Gross Margin</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:9, marginTop:8 }}>
              <h3 style={{ fontSize:28, fontWeight:900, margin:0, letterSpacing:'-1px', lineHeight:1 }}>
                {hasData ? (dTotal > 0 ? Math.round((dPaid / dTotal) * 100) + '%' : '72%') : '72%'}
              </h3>
              <span style={{ padding:'2px 7px', borderRadius:6, fontSize:9, fontWeight:800, background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }}>+4.2%</span>
            </div>
          </div>
          {/* flush-bottom sparkline */}
          <div style={{ height:52, marginLeft:-22, marginRight:-22 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark.map(d=>({m:d.m,v:d.v}))} margin={{top:2,right:0,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="spkG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.20}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="url(#spkG)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Sales Report + Sales Activity ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:14, marginBottom:16 }}>

        {/* Sales Report Area */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
          style={wCard({ padding:'22px 24px' })}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <h4 style={{ fontSize:15, fontWeight:800, margin:0 }}>Sales Report Area</h4>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                <span style={{ padding: '2px 6px', borderRadius: 6, fontSize: 9, fontWeight: 800, background: '#fee2e2', color: '#b91c1c' }}>-4.5%</span>
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>vs last years</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11, color:'#64748b', fontWeight:600, background:'#f8fafc', padding:'4px 10px', borderRadius:8, border:'1px solid #e8edf5' }}>Monthly ∨</span>
              <div style={{ display:'flex', flexDirection:'column', gap:3, marginLeft:4 }}>
                {[0,1,2].map(i=><span key={i} style={{width:4,height:4,borderRadius:'50%',background:'#cbd5e1',display:'block'}}/>)}
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 160px', gap:24, alignItems:'flex-end' }}>
            {/* Bars */}
            <div style={{ position:'relative', display:'flex', alignItems:'flex-end', gap:12, height:`${BAR_H+40}px`, borderBottom:'2px solid #f1f5f9', paddingBottom:0 }}>
              {bars.map((b) => (
                <div key={b.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, height:'100%', justifyContent:'flex-end', position:'relative' }}>
                  {/* pct bubble */}
                  <div style={{ position:'absolute', bottom:b.h+10, left:'50%', transform:'translateX(-50%)',
                    background:'#1e293b', color:'#fff', fontSize:9, fontWeight:800, padding:'3px 8px', borderRadius:8, whiteSpace:'nowrap', zIndex:2 }}>
                    {b.pct}
                  </div>
                  {/* bar */}
                  <div style={{ width:'100%', maxWidth:48, borderRadius:'10px 10px 0 0', height:`${b.h}px`,
                    background:`linear-gradient(to top, ${b.color}, ${b.gradFrom})`, transition:'height 0.8s ease', cursor:'pointer' }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:'#64748b', marginTop:9 }}>{b.label}</span>
                </div>
              ))}
              {/* curved arrow annotation */}
              <div style={{ position:'absolute', top:8, right:60, fontSize:10, color:'#64748b', fontWeight:600, maxWidth:90, textAlign:'right', lineHeight:1.4 }}>
                Target overflow<br/>
                <span style={{ color:'#0f172a', fontWeight:800 }}>by $378 profit</span>
              </div>
              <svg style={{ position:'absolute', top:20, right:12, opacity:0.4 }} width="50" height="35" viewBox="0 0 50 35">
                <path d="M 45 5 Q 40 30, 15 30" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arr)" strokeLinecap="round"/>
                <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/></marker></defs>
              </svg>
            </div>

            {/* Right side */}
            <div style={{ paddingBottom:22 }}>
              <div style={{ fontSize:32, fontWeight:900, letterSpacing:'-1px', color:'#0f172a' }}>${fmt(dAvg)}</div>
              <p style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px', margin:'4px 0 16px' }}>Per unit sales</p>
              <div style={{ display:'inline-block', background:'#eff6ff', color:'#2563eb', fontSize:10, fontWeight:800, padding:'4px 12px', borderRadius:8 }}>
                Target overflow
              </div>
              <p style={{ fontSize:11, color:'#64748b', fontWeight:600, lineHeight:1.6, margin:'8px 0 0' }}>
                Overflow by <strong style={{color:'#0f172a'}}>$378</strong> profit
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sales Activity Gauge */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.30}}
          style={wCard({ padding:'22px 22px', display:'flex', flexDirection:'column' })}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h4 style={{ fontSize:15, fontWeight:800, margin:0 }}>Sales Activity</h4>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11, color:'#64748b', fontWeight:600, background:'#f8fafc', padding:'4px 10px', borderRadius:8, border:'1px solid #e8edf5' }}>Monthly ∨</span>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flex:1, gap:8 }}>
            {/* Gauge */}
            <div style={{ position:'relative', width:130, height:130, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ position:'absolute', transform:'rotate(135deg)' }}>
                {/* track */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e8edf5" strokeWidth="13" strokeDasharray="179.07 59.69" strokeLinecap="round"/>
                {/* paid – green */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="13" strokeDasharray={`${paidArc} ${FULL}`} strokeDashoffset={0} strokeLinecap="round"/>
                {/* pending – light blue */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#93c5fd" strokeWidth="13" strokeDasharray={`${pendArc} ${FULL}`} strokeDashoffset={-paidArc} strokeLinecap="round"/>
                {/* overdue – dark blue */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#2563eb" strokeWidth="13" strokeDasharray={`${ovdArc} ${FULL}`} strokeDashoffset={-(paidArc+pendArc)} strokeLinecap="round"/>
              </svg>
              {/* center */}
              <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:900, lineHeight:1, color:'#0f172a' }}>{fmt(inv.length > 0 ? inv.length : 786)}<span style={{fontSize:12}}>K</span></div>
                <div style={{ fontSize:9, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.6px', marginTop:3 }}>Total sell count</div>
              </div>
            </div>

            {/* Legend with BIG numbers on top */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'On Process', count: pend.length  || 45, color:'#22c55e' },
                { label:'Canceled',   count: ovd.length   || 23, color:'#93c5fd' },
                { label:'Delivered',  count: paid.length  || 32, color:'#2563eb' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
                  <span style={{ fontSize:32, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{item.count}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:item.color, display:'block', flexShrink:0 }}/>
                    <span style={{ fontSize:10, color:'#94a3b8', fontWeight:600 }}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Row 3: Best Sellers + Most Order by Country ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:14, marginBottom:16 }}>

        {/* Best Sellers */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
          style={wCard({ padding:'22px 24px' })}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h4 style={{ fontSize:15, fontWeight:800, margin:0 }}>Best Sellers</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {[0,1,2].map(i=><span key={i} style={{width:4,height:4,borderRadius:'50%',background:'#cbd5e1',display:'block'}}/>)}
            </div>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
                {['Seller','Stats','Total'].map((h,hi)=>(
                  <th key={h} style={{ paddingBottom:10, fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:'0.5px', textAlign: hi===2?'right':hi===1?'center':'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCust.map((c,idx)=>(
                <tr key={c.name} style={{ borderBottom: idx<topCust.length-1?'1px solid #f8fafc':'none' }}>
                  <td style={{ padding:'12px 0' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:`${c.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:c.color, flexShrink:0 }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:800, color:'#1e293b', margin:0, lineHeight:1.2 }}>{c.name}</p>
                        <p style={{ fontSize:10, color:'#94a3b8', fontWeight:600, margin:'2px 0 0' }}>{idx === 0 ? '524' : idx * 110 + 120}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 0', textAlign:'center' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:'#f0fdf4', color:'#16a34a', border: '1px solid #bbf7d0' }}>
                      +{((5 - idx) * 0.8 + 1.8).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding:'12px 0', textAlign:'right', fontSize:13, fontWeight:900, color:'#0f172a' }}>
                    ${fmt2(c.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Most Order by Country */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.40}}
          style={wCard({ padding:'22px 22px', display:'flex', flexDirection:'column' })}>
          {/* faint world map bg */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:100, opacity:0.06, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cellipse cx='200' cy='200' rx='180' ry='120' fill='%230f172a'/%3E%3Cellipse cx='480' cy='180' rx='140' ry='110' fill='%230f172a'/%3E%3Cellipse cx='680' cy='220' rx='80' ry='90' fill='%230f172a'/%3E%3C/svg%3E")`, backgroundSize:'cover', backgroundPosition:'center', pointerEvents:'none', zIndex:0 }} />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, position:'relative', zIndex:1 }}>
            <h4 style={{ fontSize:15, fontWeight:800, margin:0 }}>Most Order by Country</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {[0,1,2].map(i=><span key={i} style={{width:4,height:4,borderRadius:'50%',background:'#cbd5e1',display:'block'}}/>)}
            </div>
          </div>

          <div style={{ marginBottom:16, position:'relative', zIndex:1 }}>
            <span style={{ fontSize:30, fontWeight:900, letterSpacing:'-1px', color:'#0f172a' }}>${hasData ? fmt(dTotal) : '4256'}</span>
            <p style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px', margin:'4px 0 0' }}>International Transaction</p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12, flex:1, position:'relative', zIndex:1 }}>
            {COUNTRIES.map(c=>(
              <div key={c.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18, lineHeight:1, flexShrink:0 }}>{c.flag}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'#334155', width:68, flexShrink:0 }}>{c.name}</span>
                <div style={{ flex:1, height:5, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${c.pct*3.3}%`, background:c.color, borderRadius:99, transition:'width 1s ease' }}/>
                </div>
                <span style={{ fontSize:11, fontWeight:800, color:'#0f172a', width:32, textAlign:'right', flexShrink:0 }}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Row 4: Recent Invoices ── */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.45}}
        style={wCard({ overflow:'hidden' })}>
        <div style={{ padding:'16px 24px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f8fafc' }}>
          <h4 style={{ fontSize:15, fontWeight:800, margin:0 }}>Recent Invoices</h4>
          <button onClick={()=>onViewChange?.('invoices')}
            style={{ fontSize:11, fontWeight:700, color:'#2563eb', background:'#eff6ff', border:'none', borderRadius:8, padding:'5px 14px', cursor:'pointer' }}>
            View All →
          </button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#fafbfc' }}>
                {['Invoice','Customer','Issue Date','Due Date','Amount ($)','Status'].map(h=>(
                  <th key={h} style={{ padding:'9px 20px', fontSize:10, fontWeight:800, color:'#94a3b8', textAlign:'left', letterSpacing:'0.6px', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r: any)=>(
                <tr key={r.id} style={{ borderTop:'1px solid #f8fafc' }}>
                  <td style={{ padding:'11px 20px', fontSize:12, fontWeight:800, color:'#334155', fontFamily:'monospace' }}>{r.id}</td>
                  <td style={{ padding:'11px 20px', fontSize:13, fontWeight:600, color:'#0f172a' }}>{r.customer}</td>
                  <td style={{ padding:'11px 20px', fontSize:12, color:'#94a3b8', fontWeight:500 }}>{r.issueDate}</td>
                  <td style={{ padding:'11px 20px', fontSize:12, color:'#94a3b8', fontWeight:500 }}>{r.dueDate}</td>
                  <td style={{ padding:'11px 20px', fontSize:13, fontWeight:800, color:'#0f172a' }}>${fmt(r.rawAmount||0)}</td>
                  <td style={{ padding:'11px 20px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                      background: badge[r.status]?.bg||'#f1f5f9', color: badge[r.status]?.color||'#64748b' }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
