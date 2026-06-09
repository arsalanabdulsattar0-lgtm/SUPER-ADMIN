import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvoiceData } from './types';
import Layout from './components/layout/Layout';

// Static page imports for instantaneous and smooth transitions
import Dashboard from './pages/Invoices/Dashboard/Dashboard';
import Dashboard1 from './pages/Invoices/Dashboard/Dashboard1';
import Dashboard2 from './pages/Invoices/Dashboard/Dashboard2';
import InvoiceEditorV4 from './pages/Invoices/InvoiceEditorV4';
import InvoiceListModule from './pages/Invoices/InvoiceList';
import CustomerManagement from './pages/Customers/CustomerManagement';
import Settings from './pages/Settings/Settings';
import Help from './pages/Help/Help';
import Login from './pages/Auth/Login';
import ProductList from './pages/Products/ProductList';
import InlineProductForm from './components/ui/InlineProductForm';

// Static imports for types / initial data only
import { initialInvoices } from './pages/Invoices/invoiceTypes';
import type { Invoice } from './pages/Invoices/invoiceTypes';

type View = 'dashboard' | 'dashboard1' | 'dashboard2' | 'invoices' | 'add-invoice' | 'add-invoice-v2' | 'add-invoice-v3' | 'add-invoice-v4' | 'customers' | 'products' | 'settings' | 'help';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('is_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [activeView, setActiveView] = useState<View>(() => {
    try {
      const stored = localStorage.getItem('active_view');
      if (stored) return stored as View;
    } catch {}
    return 'dashboard';
  });
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productFormInitialData, setProductFormInitialData] = useState<any>(undefined);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem('invoice_list');
      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        // If it's the old default list (length <= 8), reset to the new 30 initialInvoices
        if (parsed.length <= 8) {
          return initialInvoices;
        }
        return parsed.map((inv: any) => ({
          ...inv,
          customer: inv.customer || inv.client || 'Unknown Customer',
          customerInitials: inv.customerInitials || inv.clientInitials || (inv.customer || inv.client || 'UC').slice(0, 2).toUpperCase(),
          customerColor: inv.customerColor || inv.clientColor || '#16a34a',
        }));
      }
      return initialInvoices;
    } catch {
      return initialInvoices;
    }
  });

  // Auto-save invoice list to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem('invoice_list', JSON.stringify(invoiceList)); } catch { /* ignore */ }
  }, [invoiceList]);

  // Sync active view to localStorage
  useEffect(() => {
    try { localStorage.setItem('active_view', activeView); } catch { /* ignore */ }
  }, [activeView]);

  useEffect(() => {
    const handleOpenProductForm = (e: any) => {
      setProductFormInitialData(e.detail?.product);
      setIsProductFormOpen(true);
    };
    window.addEventListener('open-product-form', handleOpenProductForm);
    return () => window.removeEventListener('open-product-form', handleOpenProductForm);
  }, []);

  const generatedItems = Array.from({ length: 30 }, (_, i) => ({
    id: `gen-${i + 1}`,
    productCode: `PROD-${1000 + i}`,
    description: `Automated Test Product ${i + 1} - High Performance Test`,
    unit: 'Job',
    unitDetails: 'Standard',
    quantity: 1,
    price: 50 + (i * 2),
    discount: 0,
    tax: 0,
    furtherTax: 0
  }));

  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: 'SI-000248',
    date: '2026-05-12',
    dueDate: '2026-05-26',
    senderName: 'Antigravity Creative Studio',
    senderAddress: '452 Innovation Blvd, San Francisco, CA 94107\ncontact@antigravity.studio | +1 (555) 012-3456',
    customerName: 'BlueRitt Technologies Inc.',
    customerAddress: '88 Tech Park Way, Austin, TX 78701\nbilling@blueritt.com',
    subject: 'Brand Identity & Web Development - Phase 1',
    reference: 'PO-2026-004',
    items: generatedItems,
    taxRate: 8,
    discountPercentage: 5,
    discountAmount: 0,
    shippingCharges: 25,
    roundOff: 0,
    receivedAmount: 0,
    bankAccount: 'chase',
    notes: 'Please include the invoice number in your wire transfer reference.\nPayment via ACH or Wire Transfer to Chase Bank Account #....4521.',
    productCode: '',
    remarks: '',
    type: 'Standard',
  });

  // Save default invoice data to localStorage if not present
  useEffect(() => {
    try {
      const key = 'invoice_detail_SI-000248';
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(invoice));
      }
    } catch { /* ignore */ }
  }, []);

  const [printInvoiceData, setPrintInvoiceData] = useState<Invoice | null>(null);
  const [printInvoiceFullData, setPrintInvoiceFullData] = useState<InvoiceData | null>(null);

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Loading…</div>}>
        <Login onLogin={() => {
          try { localStorage.setItem('is_logged_in', 'true'); } catch {}
          setIsLoggedIn(true);
        }} />
      </Suspense>
    );
  }

  const handlePrintInvoice = (inv: Invoice) => {
    try {
      const stored = localStorage.getItem(`invoice_detail_${inv.id}`);
      if (stored) {
        setPrintInvoiceFullData(JSON.parse(stored) as InvoiceData);
      } else {
        setPrintInvoiceFullData(null);
      }
    } catch {
      setPrintInvoiceFullData(null);
    }
    setPrintInvoiceData(inv);
    setTimeout(() => {
      window.print();
      setPrintInvoiceData(null);
      setPrintInvoiceFullData(null);
    }, 150);
  };


  const handleSaveInvoice = (data: InvoiceData) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
    const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

    const initials = data.customerName ? data.customerName.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : 'IV';
    const colors = ['#2759CD', '#10B981', '#F59E0B', '#8B5CF6', '#EE4932', '#0EA5E9', '#EC4899', '#14B8A6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const updatedInvoice: Invoice = {
      id: data.invoiceNumber || 'INV-' + Math.floor(1000 + Math.random() * 9000),
      customer: data.customerName || 'Unnamed Customer',
      customerInitials: initials,
      customerColor: randomColor,
      issueDate: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      amount: `Rs. ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: netPayable,
      status: 'Draft',
      payment: 'Net 30',
      type: data.type || 'Standard'
    };

    try {
      localStorage.setItem(`invoice_detail_${updatedInvoice.id}`, JSON.stringify(data));
    } catch { /* ignore */ }

    setInvoiceList(prev => {
      const exists = prev.some(x => x.id === updatedInvoice.id);
      if (exists) {
        return prev.map(x => x.id === updatedInvoice.id ? updatedInvoice : x);
      } else {
        return [updatedInvoice, ...prev];
      }
    });

    alert(`Invoice ${updatedInvoice.id} created & saved successfully!`);
    setActiveView('invoices');
  };

  const handleEditInvoice = (id: string) => {
    try {
      const stored = localStorage.getItem(`invoice_detail_${id}`);
      if (stored) {
        setInvoice(JSON.parse(stored) as InvoiceData);
        setActiveView('add-invoice-v4');
      } else {
        const inv = invoiceList.find(i => i.id === id);
        if (inv) {
          const fallback: InvoiceData = {
            invoiceNumber: inv.id,
            date: inv.issueDate,
            dueDate: inv.dueDate,
            senderName: 'Antigravity Creative Studio',
            senderAddress: '452 Innovation Blvd, San Francisco, CA 94107',
            customerName: inv.customer,
            customerAddress: 'Enterprise Customer Account',
            subject: 'Services Rendered',
            reference: '',
            productCode: '',
            remarks: '',
            type: inv.type || 'Standard',
            items: [
              {
                id: '1',
                productCode: 'BC-001',
                description: `${inv.type || 'Standard'} Services & Deliverables`,
                unit: 'Job',
                unitDetails: '',
                quantity: 1,
                price: inv.rawAmount || 0,
                discount: 0,
                tax: 0,
                furtherTax: 0
              }
            ],
            taxRate: 0,
            discountPercentage: 0,
            discountAmount: 0,
            shippingCharges: 0,
            roundOff: 0,
            receivedAmount: 0,
            bankAccount: '',
            notes: `Please include the invoice number ${inv.id} in your wire transfer reference.`
          };
          setInvoice(fallback);
          setActiveView('add-invoice-v4');
        } else {
          alert('Invoice not found!');
        }
      }
    } catch {
      alert('Failed to load invoice data!');
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard invoiceItems={invoiceList} onViewChange={(v) => setActiveView(v as View)} />;
      case 'dashboard1':
        return <Dashboard1 invoiceItems={invoiceList} onViewChange={(v) => setActiveView(v as View)} />;
      case 'dashboard2':
        return <Dashboard2 invoiceItems={invoiceList} onViewChange={(v) => setActiveView(v as View)} />;
      case 'add-invoice':
        return <div>Invoice creation is handled via AI Inline Panel.</div>;
      case 'add-invoice-v2':
        return <div>Invoice creation v2 handled via AI Inline Panel.</div>;
      case 'add-invoice-v3':
        return <div>Invoice creation v3 handled via AI Inline Panel.</div>;
      case 'add-invoice-v4':
        return <InvoiceEditorV4 data={invoice} onChange={setInvoice} onSave={handleSaveInvoice} onViewChange={(v) => setActiveView(v as View)} onPrint={handlePrintInvoice} />;
      case 'invoices':
        return <InvoiceListModule invoiceItems={invoiceList} setInvoiceItems={setInvoiceList} onViewChange={(v) => setActiveView(v as View)} onPrintInvoice={handlePrintInvoice} onEditInvoice={handleEditInvoice} />;
      case 'customers':
        return <CustomerManagement />;
      case 'products':
        return <ProductList onAddProductClick={() => {
          setProductFormInitialData(undefined);
          setIsProductFormOpen(true);
        }} />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <Help />;
      default:
        return <Dashboard />;
    }
  };

  const loadingFallback = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Loading…</div>
  );

  return (
    <Suspense fallback={loadingFallback}>
      <Layout activeView={activeView} onViewChange={(v) => setActiveView(v as View)} onLogout={() => {
        try {
          localStorage.removeItem('is_logged_in');
          localStorage.removeItem('active_view');
        } catch {}
        setIsLoggedIn(false);
        setActiveView('dashboard');
      }}>
        <Suspense fallback={loadingFallback}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </Layout>

      <InlineProductForm
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        initialData={productFormInitialData}
      />

      {/* Hidden Printable Invoice Area */}
      {printInvoiceData && (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-invoice-container, #printable-invoice-container * {
                visibility: visible !important;
              }
              #printable-invoice-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                color: black !important;
                padding: 40px !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
            }
            @media screen {
              #printable-invoice-container {
                display: none !important;
              }
            }
          `}} />

          <div id="printable-invoice-container" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px', lineHeight: '1.6', background: 'white', color: '#1e293b', padding: '40px', margin: 0 }}>
            {/* Header: Company & Invoice title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Antigravity Creative Studio</h1>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.7' }}>
                  452 Innovation Blvd, San Francisco, CA 94107<br />
                  contact@antigravity.studio | +1 (555) 012-3456
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#2759CD', margin: 0, letterSpacing: '2px' }}>Invoice</h2>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>#{printInvoiceData.id}</p>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px', lineHeight: '1.8' }}>
                  <div><strong>Issue date:</strong> {printInvoiceData.issueDate}</div>
                  <div><strong>Due date:</strong> {printInvoiceData.dueDate}</div>
                  <div><strong>Payment term:</strong> {printInvoiceData.payment}</div>
                  <div><strong>Status:</strong> {printInvoiceData.status}</div>
                </div>
              </div>
            </div>

            {/* Billing Details Block */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '2px', color: '#94a3b8', marginBottom: '8px' }}>From</h3>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Antigravity Creative Studio</h4>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.7' }}>
                  452 Innovation Blvd, San Francisco, CA 94107<br />
                  contact@antigravity.studio<br />
                  +1 (555) 012-3456
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '2px', color: '#94a3b8', marginBottom: '8px' }}>Bill to</h3>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{printInvoiceData.customer}</h4>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.7' }}>
                  Enterprise Customer Account<br />
                  Invoice type: {printInvoiceData.type}
                </p>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  {['Code', 'Description', 'Unit', 'Qty', 'Rate (Rs.)', 'Tax (Rs.)', 'Discount (Rs.)', 'Total (Rs.)'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', fontSize: '9px', fontWeight: 900, letterSpacing: '1px', color: '#64748b', textAlign: (h === 'Description' || h === 'Code') ? 'left' : 'right', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {printInvoiceFullData ? (
                  printInvoiceFullData.items.map(item => {
                    const itemTotal = (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', color: '#1e293b', textAlign: 'left', fontFamily: 'monospace' }}>{item.productCode}</td>
                        <td style={{ padding: '12px', color: '#475569', textAlign: 'left' }}>{item.description}</td>
                        <td style={{ padding: '12px', color: '#64748b', textAlign: 'right' }}>{item.unit}</td>
                        <td style={{ padding: '12px', color: '#334155', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '12px', color: '#64748b', textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                        <td style={{ padding: '12px', color: '#16a34a', textAlign: 'right' }}>+{item.tax + (item.furtherTax || 0) === 0 ? '0.00' : (item.tax + (item.furtherTax || 0)).toFixed(2)}</td>
                        <td style={{ padding: '12px', color: '#dc2626', textAlign: 'right' }}>-{item.discount === 0 ? '0.00' : item.discount.toFixed(2)}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{itemTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', color: '#1e293b', textAlign: 'left', fontFamily: 'monospace' }}>BC-001</td>
                    <td style={{ padding: '12px', color: '#475569', textAlign: 'left' }}>{printInvoiceData.type} Services & Deliverables</td>
                    <td style={{ padding: '12px', color: '#64748b', textAlign: 'right' }}>Job</td>
                    <td style={{ padding: '12px', color: '#334155', textAlign: 'right' }}>1</td>
                    <td style={{ padding: '12px', color: '#64748b', textAlign: 'right' }}>{printInvoiceData.amount.replace(/^(Rs\.|PKR|\$)\s*/i, '').replace(/,/g, '')}</td>
                    <td style={{ padding: '12px', color: '#16a34a', textAlign: 'right' }}>+0.00</td>
                    <td style={{ padding: '12px', color: '#dc2626', textAlign: 'right' }}>-0.00</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{printInvoiceData.amount.replace(/^(Rs\.|PKR|\$)\s*/i, '').replace(/,/g, '')}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Summary Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
              <div style={{ width: '280px' }}>
                {(() => {
                  let subtotal = 0;
                  let taxRate = 0;
                  let taxAmount = 0;
                  let discountVal = 0;
                  let shippingCharges = 0;
                  let roundOff = 0;
                  let netPayable = 0;
                  let receivedAmount = 0;
                  let balanceDue = 0;

                  if (printInvoiceFullData) {
                    subtotal = printInvoiceFullData.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0), 0);
                    taxRate = printInvoiceFullData.taxRate || 0;
                    taxAmount = (subtotal * taxRate) / 100;
                    discountVal = printInvoiceFullData.discountAmount || (subtotal * (printInvoiceFullData.discountPercentage || 0)) / 100;
                    shippingCharges = printInvoiceFullData.shippingCharges || 0;
                    roundOff = printInvoiceFullData.roundOff || 0;
                    netPayable = subtotal + taxAmount - discountVal + shippingCharges + roundOff;
                    receivedAmount = printInvoiceFullData.receivedAmount || 0;
                    balanceDue = netPayable - receivedAmount;
                  } else {
                    const rawStr = printInvoiceData.amount.replace(/^(Rs\.|PKR|\$)\s*/i, '').replace(/,/g, '');
                    netPayable = parseFloat(rawStr) || 0;
                    subtotal = netPayable;
                    balanceDue = netPayable;
                  }

                  const rows = [
                    { label: 'Gross subtotal (Rs.)', value: subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
                    { label: `Tax (${taxRate}%) (Rs.)`, value: `+${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                    { label: 'Discount (Rs.)', value: `-${discountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                    { label: 'Shipping (Rs.)', value: `+${shippingCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  ];

                  return (
                    <>
                      {rows.map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 4px', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>{row.label}</span>
                          <span style={{ color: '#334155', fontWeight: 700 }}>{row.value}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 4px', marginTop: '4px', background: '#2759CD', borderRadius: '6px' }}>
                        <span style={{ color: 'white', fontWeight: 900, fontSize: '13px' }}>Net total (Rs.)</span>
                        <span style={{ color: 'white', fontWeight: 900, fontSize: '15px' }}>{netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      {receivedAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 4px', borderBottom: '1px solid #f1f5f9', fontSize: '11px', marginTop: '4px' }}>
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>Amount received (Rs.)</span>
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>-{receivedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {balanceDue !== netPayable && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', marginTop: '4px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px' }}>
                          <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '11px' }}>Balance due (Rs.)</span>
                          <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '12px' }}>{balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Notes */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', fontSize: '10px', color: '#94a3b8' }}>
              <h5 style={{ fontWeight: 800, color: '#64748b', marginBottom: '4px', fontSize: '11px' }}>Notes & payment terms:</h5>
              <p style={{ margin: 0, lineHeight: '1.7' }}>
                Please include the invoice number <strong>{printInvoiceData.id}</strong> in your wire transfer reference.<br />
                Payment via ACH or Wire Transfer. All invoices are due within {printInvoiceData.payment === 'Net 30' ? '30 days' : printInvoiceData.payment === 'Net 15' ? '15 days' : 'the agreed term'}.<br />
                Thank you for your business — Antigravity Creative Studio.
              </p>
            </div>
          </div>
        </>
      )}
    </Suspense>
  );
}

export default App;
