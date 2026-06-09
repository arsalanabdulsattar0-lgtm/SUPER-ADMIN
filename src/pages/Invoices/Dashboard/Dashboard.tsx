import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InvoiceItem {
  id: string;
  customer: string;
  customerInitials: string;
  customerColor: string;
  issueDate: string;
  dueDate: string;
  amount: string;
  rawAmount: number;
  status: 'Draft' | 'Paid' | 'Pending' | 'Overdue';
  payment: string;
  type: string;
}

interface DashboardProps {
  invoiceItems?: InvoiceItem[];
  onViewChange?: (view: string) => void;
}

const statusStyle: Record<InvoiceItem['status'], { bg: string; text: string }> = {
  Paid: { bg: "#dcfce7", text: "#15803d" },
  Pending: { bg: "#fef9c3", text: "#a16207" },
  Overdue: { bg: "#fee2e2", text: "#b91c1c" },
  Draft: { bg: "#f1f5f9", text: "#64748b" },
};


export default function Dashboard({ invoiceItems, onViewChange }: DashboardProps) {
  const [trendFilter, setTrendFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');

  const invoicesToUse = useMemo(() => {
    const raw = invoiceItems && invoiceItems.length > 0
      ? invoiceItems
      : (() => {
          try {
            const stored = localStorage.getItem('invoice_list');
            if (stored) return JSON.parse(stored);
          } catch {}
          return [];
        })();
    return raw.map((inv: any) => ({
      ...inv,
      customer: inv.customer || inv.client || 'Unknown Customer',
      customerInitials: inv.customerInitials || inv.clientInitials || (inv.customer || inv.client || 'UC').slice(0, 2).toUpperCase(),
      customerColor: inv.customerColor || inv.clientColor || '#16a34a',
    }));
  }, [invoiceItems]);

  // 1. Compute stats dynamically
  const outstandingInvoices = invoicesToUse.filter((inv: InvoiceItem) => inv.status === 'Pending' || inv.status === 'Overdue');
  const outstandingSum = outstandingInvoices.reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0);
  const outstandingCount = outstandingInvoices.length;

  const paidInvoices = invoicesToUse.filter((inv: InvoiceItem) => inv.status === 'Paid');
  const paidSum = paidInvoices.reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0);
  const paidCount = paidInvoices.length;

  const overdueInvoices = invoicesToUse.filter((inv: InvoiceItem) => inv.status === 'Overdue');
  const overdueSum = overdueInvoices.reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0);
  const overdueCount = overdueInvoices.length;

  const avgInvoiceVal = invoicesToUse.length > 0
    ? invoicesToUse.reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0) / invoicesToUse.length
    : 0;

  const stats = [
    {
      label: "Outstanding",
      value: `Rs. ${outstandingSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: `${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''}`,
      accent: "#2563eb",
      dataKey: "outstanding"
    },
    {
      label: "Paid This Month",
      value: `Rs. ${paidSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: `${paidCount} invoice${paidCount !== 1 ? 's' : ''}`,
      accent: "#16a34a",
      dataKey: "paid"
    },
    {
      label: "Overdue",
      value: `Rs. ${overdueSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: `${overdueCount} invoice${overdueCount !== 1 ? 's' : ''}`,
      accent: "#dc2626",
      dataKey: "overdue"
    },
    {
      label: "Avg. Invoice",
      value: `Rs. ${avgInvoiceVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: "Overall Average",
      accent: "#7c3aed",
      dataKey: "avg"
    },
  ];
  // 2. Compute revenue chart data dynamically
  const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const hasRealData = invoicesToUse.length > 0;
  const fallbackTrends = {
    outstanding: [3000, 5000, 4000, 6000, 8000, 5000, 7000, 6000, 9000, 8000, 10000, 9000],
    paid: [10000, 12000, 15000, 18000, 22000, 25000, 24000, 28000, 32000, 30000, 35000, 40000],
    overdue: [1000, 2000, 1500, 3000, 2500, 1800, 3500, 2000, 1500, 4000, 3000, 2500],
    avg: [12000, 13000, 11000, 14000, 15000, 16000, 14500, 15500, 16500, 17000, 18000, 17500]
  };

  const finalSparklines = monthsList.map((m, idx) => {
    if (hasRealData) {
      const monthlyInvoices = invoicesToUse.filter((inv: InvoiceItem) => {
        if (!inv.issueDate) return false;
        const mIdx = parseInt(inv.issueDate.split('-')[1], 10) - 1;
        return mIdx === idx;
      });

      const outstanding = monthlyInvoices
        .filter((inv: InvoiceItem) => inv.status === 'Pending' || inv.status === 'Overdue')
        .reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0);

      const paid = monthlyInvoices
        .filter((inv: InvoiceItem) => inv.status === 'Paid')
        .reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0);

      const overdue = monthlyInvoices
        .filter((inv: InvoiceItem) => inv.status === 'Overdue')
        .reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0);

      const avg = monthlyInvoices.length > 0
        ? monthlyInvoices.reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0) / monthlyInvoices.length
        : 0;

      return {
        month: m,
        outstanding,
        paid,
        overdue,
        avg
      };
    } else {
      return {
        month: m,
        outstanding: fallbackTrends.outstanding[idx],
        paid: fallbackTrends.paid[idx],
        overdue: fallbackTrends.overdue[idx],
        avg: fallbackTrends.avg[idx]
      };
    }
  });

  // 3. Compute breakdown donut chart dynamically
  const totalInvoiceSum = invoicesToUse.reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0);
  const hasInvoices = invoicesToUse.length > 0;
  const displayPaidSum = hasInvoices ? paidSum : 48920;
  const displayPendingSum = hasInvoices ? (invoicesToUse.filter((inv: InvoiceItem) => inv.status === 'Pending').reduce((sum: number, inv: InvoiceItem) => sum + (inv.rawAmount || 0), 0)) : 9270;
  const displayOverdueSum = hasInvoices ? overdueSum : 3210;
  const displayTotalSum = hasInvoices ? totalInvoiceSum : 61400;

  const displayPaidPercent = displayTotalSum > 0 ? (displayPaidSum / displayTotalSum) * 100 : 0;
  const displayPendingPercent = displayTotalSum > 0 ? (displayPendingSum / displayTotalSum) * 100 : 0;
  const displayOverduePercent = displayTotalSum > 0 ? (displayOverdueSum / displayTotalSum) * 100 : 0;

  const circ = 238.76;
  const paidStroke = (displayPaidPercent / 100) * circ;
  const pendingStroke = (displayPendingPercent / 100) * circ;
  const overdueStroke = (displayOverduePercent / 100) * circ;

  const pendingDashOffset = -paidStroke;
  const overdueDashOffset = -(paidStroke + pendingStroke);

  // 4. Compute top customers dynamically
  const customerTotals: { [name: string]: { name: string; amount: number; color: string } } = {};
  invoicesToUse.forEach((inv: InvoiceItem) => {
    if (!customerTotals[inv.customer]) {
      customerTotals[inv.customer] = {
        name: inv.customer,
        amount: 0,
        color: inv.customerColor || '#16a34a',
      };
    }
    customerTotals[inv.customer].amount += inv.rawAmount || 0;
  });

  const sortedCustomers = Object.values(customerTotals).sort((a, b) => b.amount - a.amount);
  const displayCustomers = sortedCustomers.length > 0
    ? sortedCustomers.slice(0, 5)
    : [
        { name: "Northwind Studio", amount: 18130, color: "#16a34a" },
        { name: "Helix Labs", amount: 14280, color: "#2563eb" },
        { name: "Marrow & Co.", amount: 9840, color: "#7c3aed" },
        { name: "Sable Foundry", amount: 7560, color: "#ea580c" },
        { name: "Quill Press", amount: 5380, color: "#0891b2" },
      ];

  const maxCustomerAmount = displayCustomers.length > 0 ? displayCustomers[0].amount : 1;
  const topCustomersData = displayCustomers.map(c => ({
    name: c.name || 'Unknown Customer',
    url: `${(c.name || 'Unknown').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    amount: c.amount,
    progress: (c.amount / maxCustomerAmount) * 100,
    color: c.color,
  }));

  // 5. Trend chart data (reference-image style) - Revenue Trend
  const trendData = useMemo(() => {
    const filtered = trendFilter === 'All'
      ? invoicesToUse
      : invoicesToUse.filter((inv: InvoiceItem) => inv.status === trendFilter);

    const amounts = monthsList.reduce((acc, m) => { acc[m] = 0; return acc; }, {} as Record<string, number>);
    filtered.forEach((inv: InvoiceItem) => {
      if (inv.issueDate) {
        const mIdx = parseInt(inv.issueDate.split('-')[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          amounts[monthsList[mIdx]] += inv.rawAmount || 0;
        }
      }
    });

    const hasRealData = filtered.some((inv: InvoiceItem) => (inv.rawAmount || 0) > 0);
    // Fallback: a smooth bell-curve scaled for revenue so the card always looks stunning
    const fallback = [10000, 15000, 20000, 25000, 25000, 45000, 35000, 30000, 25000, 20000, 15000, 10000];
    return monthsList.map((m, i) => {
      const realAmount = amounts[m] || 0;
      const value = hasRealData ? realAmount : fallback[i];
      return {
        month: m,
        value: Math.round(value),
        value2: Math.round(value * 0.9),
      };
    });
  }, [invoicesToUse, trendFilter]);

  const trendTotal = useMemo(() => {
    const filtered = trendFilter === 'All'
      ? invoicesToUse
      : invoicesToUse.filter((inv: InvoiceItem) => inv.status === trendFilter);
    const total = filtered.reduce((acc: number, inv: InvoiceItem) => acc + (inv.rawAmount || 0), 0);
    // Fallback if no invoices/revenue exist yet
    if (total === 0) {
      if (trendFilter === 'All') return 120270;
      if (trendFilter === 'Paid') return 70000;
      if (trendFilter === 'Pending') return 30000;
      if (trendFilter === 'Overdue') return 20270;
    }
    return total;
  }, [invoicesToUse, trendFilter]);

  const trendDesc: Record<string, string> = {
    All: 'Total revenue across all invoice statuses.',
    Paid: 'Revenue successfully collected.',
    Pending: 'Pending revenue from unpaid invoices.',
    Overdue: 'Overdue revenue past payment deadline.',
  };

  // Peak month index for the floating dot
  const peakIdx = trendData.reduce((best, d, i) => d.value > trendData[best].value ? i : best, 0);

  // 6. Recent Invoices
  const recentInvoices = invoicesToUse.length > 0
    ? invoicesToUse.slice(0, 6)
    : [
        { id: "INV-2024", customer: "Northwind Studio", issueDate: "May 18, 2026", dueDate: "Jun 1, 2026", rawAmount: 4200, status: "Paid" },
        { id: "INV-2023", customer: "Helix Labs", issueDate: "May 15, 2026", dueDate: "May 30, 2026", rawAmount: 3800, status: "Pending" },
        { id: "INV-2022", customer: "Marrow & Co.", issueDate: "May 10, 2026", dueDate: "May 25, 2026", rawAmount: 2100, status: "Overdue" },
        { id: "INV-2021", customer: "Sable Foundry", issueDate: "May 5, 2026", dueDate: "May 20, 2026", rawAmount: 1890, status: "Paid" },
        { id: "INV-2020", customer: "Quill Press", issueDate: "Apr 28, 2026", dueDate: "May 13, 2026", rawAmount: 1200, status: "Overdue" },
        { id: "INV-2019", customer: "Northwind Studio", issueDate: "Apr 22, 2026", dueDate: "May 7, 2026", rawAmount: 5600, status: "Paid" },
      ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#111827" }}>
      <div style={{ padding: "20px 28px", maxWidth: 1280, margin: "0 auto" }}>
        
        {/* Page Header with switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0f172a' }}>
              Dashboard
            </h1>
            <p className="text-[12px] font-medium text-slate-400 mt-0.5">
              Here's your overview of your business sales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dashboard Version Switcher */}
            <div className="flex bg-slate-200/50 p-0.5 rounded-lg border border-slate-200/30">
              {[
                { id: 'dashboard', label: 'Default' },
                { id: 'dashboard1', label: 'AI insights' },
                { id: 'dashboard2', label: 'Business overview' },
              ].map(t => {
                const isActive = t.id === 'dashboard';
                return (
                  <button
                    key={t.id}
                    onClick={() => onViewChange?.(t.id)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: s.accent, borderRadius: "14px 0 0 14px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#000000", letterSpacing: "0.8px", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={s.value}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{s.sub}</div>
              </div>
              <div style={{ width: 80, height: 35, marginLeft: 12, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={finalSparklines} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id={`sparkGrad-${s.label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.accent} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={s.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey={s.dataKey}
                      stroke={s.accent}
                      strokeWidth={1.8}
                      fill={`url(#sparkGrad-${s.label.replace(/\s+/g, '')})`}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>


            {/* ── Invoice Activity Trend Card (reference-image style) ── */}
            <div style={{
              background: "#fff",
              borderRadius: 18,
              border: "1px solid #e5e7eb",
              padding: "20px 22px 0",
              overflow: "hidden",
              position: "relative",
            }}>
              {/* Top row: filter tabs + count */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                {/* Filter tabs */}
                <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
                  {(['All', 'Paid', 'Pending', 'Overdue'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTrendFilter(f)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 8,
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: trendFilter === f ? "#fff" : "transparent",
                        color: trendFilter === f ? "#111" : "#9ca3af",
                        boxShadow: trendFilter === f ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        transition: "all 0.15s",
                      }}
                    >{f}</button>
                  ))}
                </div>
                {/* Large count */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-1px", color: "#111", lineHeight: 1 }}>
                    Rs. {trendTotal.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginTop: 2 }}>Total Revenue</div>
                </div>
              </div>

              {/* Title + description */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111" }}>Revenue Trend</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{trendDesc[trendFilter]}</div>
              </div>

              {/* Chart area */}
              <div style={{ position: "relative", height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 20, right: 8, left: -32, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGrad1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
                        <stop offset="60%" stopColor="#f43f5e" stopOpacity={0.10} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="trendFill2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c7d2fe" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{
                              background: "#1e293b",
                              color: "#fff",
                              borderRadius: 10,
                              padding: "6px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                              border: "none",
                            }}>
                              Rs. {payload[0]?.value?.toLocaleString()}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value2"
                      stroke="#c7d2fe"
                      strokeWidth={1.5}
                      fill="url(#trendFill2)"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="url(#trendGrad1)"
                      strokeWidth={2.5}
                      fill="url(#trendFill)"
                      dot={(props: any) => {
                        const { cx, cy, index } = props;
                        if (index !== peakIdx) return <g key={index} />;
                        const valText = `Rs. ${Math.round(trendData[index]?.value / 1000)}k`;
                        return (
                          <g key={index}>
                            <rect x={cx - 24} y={cy - 12} width={48} height={22} rx={11} fill="#1e293b" fillOpacity={0.92} />
                            <text x={cx} y={cy + 3} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={800}>
                              {valText}
                            </text>
                          </g>
                        );
                      }}
                      activeDot={{ r: 5, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Invoices Table */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Recent Invoices</div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Invoice", "Customer", "Date", "Due Date", "Amount (Rs.)", "Status"].map((h) => (
                      <th key={h} style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "#000000", textAlign: "left", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv: any, i: number) => (
                    <tr key={inv.id} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "#374151", fontFamily: "monospace" }}>{inv.id}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500 }}>{inv.customer}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "#9ca3af" }}>{inv.issueDate}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "#9ca3af" }}>{inv.dueDate}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>{(inv.rawAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusStyle[inv.status as InvoiceItem['status']]?.bg || '#f1f5f9', color: statusStyle[inv.status as InvoiceItem['status']]?.text || '#64748b' }}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Invoice Breakdown Donut */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Invoice Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#16a34a" strokeWidth="14" strokeDasharray={`${paidStroke} 238.8`} strokeDashoffset={0} strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#fbbf24" strokeWidth="14" strokeDasharray={`${pendingStroke} 238.8`} strokeDashoffset={pendingDashOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#dc2626" strokeWidth="14" strokeDasharray={`${overdueStroke} 238.8`} strokeDashoffset={overdueDashOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <text x="50" y="48" textAnchor="middle" fill="#111" fontSize="9" fontWeight="900">Rs. {displayTotalSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}</text>
                  <text x="50" y="60" textAnchor="middle" fill="#9ca3af" fontSize="7.5" fontWeight="700">Total</text>
                </svg>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Paid", pct: `${displayPaidPercent.toFixed(1)}%`, val: `Rs. ${displayPaidSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#16a34a" },
                    { label: "Pending", pct: `${displayPendingPercent.toFixed(1)}%`, val: `Rs. ${displayPendingSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#fbbf24" },
                    { label: "Overdue", pct: `${displayOverduePercent.toFixed(1)}%`, val: `Rs. ${displayOverdueSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#dc2626" },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 3, background: s.color }} />
                        <span style={{ fontSize: 12, color: "#374151" }}>{s.label}</span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.pct}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Customers */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Top This Quarter</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>By Revenue</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {topCustomersData.map((c) => (
                  <div key={c.name}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: c.color }}>
                          {c.name[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 10, color: "#9ca3af" }}>{c.url}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>Rs. {c.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.progress}%`, background: c.color, borderRadius: 99, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}