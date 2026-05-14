import { useState } from 'react';
import type { InvoiceData } from './types';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import InvoiceEditor from './pages/Invoices/InvoiceEditor';
import InvoiceEditorV2 from './pages/Invoices/InvoiceEditorV2';
import InvoiceEditorV3 from './pages/Invoices/InvoiceEditorV3';
import InvoiceEditorV4 from './pages/Invoices/InvoiceEditorV4';
import InvoiceList from './pages/Invoices/InvoiceList';
import ClientList from './pages/Clients/ClientList';
import Settings from './pages/Settings/Settings';
import Help from './pages/Help/Help';
import Login from './pages/Auth/Login';

type View = 'dashboard' | 'invoices' | 'add-invoice' | 'add-invoice-v2' | 'add-invoice-v3' | 'add-invoice-v4' | 'clients' | 'settings' | 'help';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<View>('add-invoice');
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: 'SI-000248',
    date: '2026-05-12',
    dueDate: '2026-05-26',
    senderName: 'Antigravity Creative Studio',
    senderAddress: '452 Innovation Blvd, San Francisco, CA 94107\ncontact@antigravity.studio | +1 (555) 012-3456',
    clientName: 'BlueRitt Technologies Inc.',
    clientAddress: '88 Tech Park Way, Austin, TX 78701\nbilling@blueritt.com',
    subject: 'Brand Identity & Web Development - Phase 1',
    reference: 'PO-2026-004',
    items: [
      { id: '1', description: 'Custom Brand Identity Design (Logo, Typography, Palette)', quantity: 1, price: 2500 },
      { id: '2', description: 'React-based E-commerce Frontend Development', quantity: 1, price: 4500 },
      { id: '3', description: 'UI/UX Interactive Prototyping (Figma)', quantity: 15, price: 120 },
      { id: '4', description: 'Monthly Cloud Infrastructure Maintenance', quantity: 1, price: 450 },
    ],
    taxRate: 8,
    discountPercentage: 5,
    discountAmount: 0,
    shippingCharges: 25,
    bankAccount: 'chase',
    notes: 'Please include the invoice number in your wire transfer reference.\nPayment via ACH or Wire Transfer to Chase Bank Account #....4521.',
  });

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-invoice':
        return <InvoiceEditor data={invoice} onChange={setInvoice} />;
      case 'add-invoice-v2':
        return <InvoiceEditorV2 data={invoice} onChange={setInvoice} />;
      case 'add-invoice-v3':
        return <InvoiceEditorV3 data={invoice} onChange={setInvoice} />;
      case 'add-invoice-v4':
        return <InvoiceEditorV4 data={invoice} onChange={setInvoice} />;
      case 'invoices':
        return <InvoiceList />;
      case 'clients':
        return <ClientList />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <Help />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={(v) => setActiveView(v as View)}>
      {renderView()}
    </Layout>
  );
}

export default App;
