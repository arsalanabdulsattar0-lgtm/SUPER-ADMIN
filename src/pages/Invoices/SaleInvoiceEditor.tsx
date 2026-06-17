import React, { useState, useRef, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvoiceData, InvoiceItem } from '../../types';
import type { Invoice } from './InvoiceList';
import {
  Plus,
  Trash2,
  Save,
  Upload,
  Search,
  X,
  Package,
  Printer,
  FileText,
  User,
  ChevronDown
} from 'lucide-react';
import { Input, TextArea, Select, ComboBox, ScrollArea } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { sampleCustomers } from '../../utils/customerData';
import { sampleProducts } from '../../utils/productData';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Toast } from '../../components/ui/Toast';
import { AlertModal } from '../../components/ui/AlertModal';
import { seedPrintTemplates } from '../../utils/settingsData';
import { getCodeSettingsForBranch } from '../../utils/codeSettingsHelper';
import type { BranchCodeSettings } from '../../utils/codeSettingsHelper';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onSave?: (data: InvoiceData) => void;
  onViewChange?: (view: string) => void;
  onPrint?: (inv: Invoice, templateId?: string) => void;
}





const InvoiceEditorV4: React.FC<Props> = ({ data, onChange, onSave, onViewChange, onPrint }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');

  const departmentOptions = useMemo(() => {
    try {
      const stored = localStorage.getItem('departments');
      const list = stored ? JSON.parse(stored) : [];
      const activeDepts = list.filter((d: any) => d.active);
      if (activeDepts.length > 0) {
        return [
          { value: '', label: 'Select Department' },
          ...activeDepts.map((d: any) => ({ value: d.id, label: `${d.id}-${d.name}` }))
        ];
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { value: '', label: 'Select Department' },
      { value: 'HR', label: 'HR-Human Resources' },
      { value: 'FIN', label: 'FIN-Finance Department' },
      { value: 'ACC', label: 'ACC-Accounts Department' },
      { value: 'SALES', label: 'SALES-Sales Department' },
      { value: 'PUR', label: 'PUR-Purchase Department' },
      { value: 'INV', label: 'INV-Inventory Department' },
      { value: 'IT', label: 'IT-Information Technology' },
    ];
  }, []);

  const codeSetting = useMemo(() => {
    try {
      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');
      const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
      const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
      
      let key: keyof BranchCodeSettings = 'sale_invoice';
      if (data.type === 'Service Invoice') key = 'service_invoice';
      if (data.type === 'Digital Invoice') key = 'digital_invoice';
      
      return getCodeSettingsForBranch(currentCoId, currentBrId)[key];
    } catch {
      return { mode: 'auto' as const, prefix: 'INV-', nextNumber: 1, padding: 1 };
    }
  }, [data.type]);

  const docSettings = useMemo(() => {
    try {
      const stored = localStorage.getItem('document_view_settings');
      const allSettings = stored ? JSON.parse(stored) : {};
      const currentType = data.type || 'Sale Invoice';
      const settingsForType = allSettings[currentType] || {};
      
      const defaultFields = {
        'Customer': true,
        'Issue Date': true,
        'Invoice ID': true,
        'Reference': true,
        'Customer Address': true,
        'Due Date': true,
        'Invoice Type': true,
        'Department': true,
        'Sales Person': true,
        'Notes & Special Terms': true,
        'Document Attachments': true,
        'Discount (%)': true,
        'Shipping Charges': true,
        'Round Off': true,
      };
      
      const defaultColumns = {
        'Product Code': true,
        'Description': true,
        'Unit': true,
        'Details': true,
        'Qty': true,
        'Price': true,
        'Discount': true,
        'Tax': true,
        'Further Tax': true,
        'Total': true,
      };
      
      return {
        fields: { ...defaultFields, ...settingsForType.fields },
        columns: { ...defaultColumns, ...settingsForType.columns },
      };
    } catch (e) {
      console.error('Failed to parse document settings', e);
      return {
        fields: {
          'Customer': true, 'Issue Date': true, 'Invoice ID': true, 'Reference': true,
          'Customer Address': true, 'Due Date': true, 'Invoice Type': true, 'Department': true, 'Sales Person': true,
          'Notes & Special Terms': true, 'Document Attachments': true, 'Discount (%)': true, 'Shipping Charges': true, 'Round Off': true
        },
        columns: {
          'Product Code': true, 'Description': true, 'Unit': true, 'Details': true,
          'Qty': true, 'Price': true, 'Discount': true, 'Tax': true, 'Further Tax': true, 'Total': true
        }
      };
    }
  }, [data.type]);

  const visibleColsCount = useMemo(() => {
    return [
      true, // '#'
      docSettings.columns['Product Code'],
      docSettings.columns['Description'],
      docSettings.columns['Unit'],
      docSettings.columns['Details'],
      docSettings.columns['Qty'],
      docSettings.columns['Price'],
      docSettings.columns['Discount'],
      docSettings.columns['Tax'],
      docSettings.columns['Further Tax'],
      docSettings.columns['Total'],
      true, // delete button
    ].filter(Boolean).length;
  }, [docSettings]);

  const summaryColSpan = useMemo(() => {
    return [
      docSettings.columns['Product Code'],
      docSettings.columns['Description'],
      docSettings.columns['Unit'],
      docSettings.columns['Details']
    ].filter(Boolean).length;
  }, [docSettings]);

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'new' | 'close' }>({ isOpen: false, type: 'new' });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title?: string; message: string; variant?: 'warning' | 'error' | 'info' }>({ isOpen: false, message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessageData, setToastMessageData] = useState<{ isOpen: boolean; messages: string[] }>({ isOpen: false, messages: [] });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>((window as any).isSidebarCollapsed || false);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsSidebarCollapsed(customEvent.detail.isCollapsed);
    };
    window.addEventListener('sidebar-toggle', handleToggle);
    return () => window.removeEventListener('sidebar-toggle', handleToggle);
  }, []);

  const unitWidth = isSidebarCollapsed ? 'w-20' : 'w-16';
  const detailsWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const qtyWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const priceWidth = isSidebarCollapsed ? 'w-24' : 'w-24';
  const discountWidth = isSidebarCollapsed ? 'w-28' : 'w-24';
  const taxWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const furtherTaxWidth = isSidebarCollapsed ? 'w-32' : 'w-28';
  const totalWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const descriptionWidth = '';
  const tableMinW = isSidebarCollapsed ? 'min-w-[1170px]' : 'min-w-[1020px]';

  const [files, setFiles] = useState<{ name: string, size: string }[]>([]);

  const removeFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, idx) => idx !== indexToRemove));
  };



  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedTemplateForPdf, setSelectedTemplateForPdf] = useState<string | null>(null);

  const [templates, setTemplates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('print_templates');
      let parsed = stored ? JSON.parse(stored) : seedPrintTemplates;
      
      // Ensure missing templates are added
      const existingIds = new Set(parsed.map((t: any) => t.template_id));
      const missing = seedPrintTemplates.filter(t => !existingIds.has(t.template_id));
      if (missing.length > 0) {
        parsed = [...parsed, ...missing];
        localStorage.setItem('print_templates', JSON.stringify(parsed));
      }
      
      // Migrate srt-1 from Thermal to A4 if stored previously
      let migrated = false;
      parsed = parsed.map((t: any) => {
        if (t.template_id === 'srt-1' && t.paper_size === 'Thermal') {
          migrated = true;
          return {
            ...t,
            paper_size: 'A4',
            orientation: 'Portrait',
            logo_size: 80,
            qr_enabled: false,
            barcode_enabled: false,
            signature_enabled: true,
            terms_enabled: true
          };
        }
        return t;
      });
      if (migrated) {
        localStorage.setItem('print_templates', JSON.stringify(parsed));
      }

      const deletedIds = new Set(['pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-7', 'pt-8', 'pt-9', 'pt-10', 'pt-11', 'pt-12', 'si-2', 'srt-2', 'srt-3', 'srt-4']);
      return parsed.filter((t: any) => !deletedIds.has(t.template_id));
    } catch {
      return seedPrintTemplates;
    }
  });


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.split-button-dropdown') && !target.closest('.split-button-trigger')) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);


  const handleDownloadExcelForFormat = (formatKey: 'retail' | 'wologo' | 'delivery' | 'tax') => {
    const labelMap = {
      retail: 'Retail',
      wologo: 'WithoutLogo',
      delivery: 'Delivery',
      tax: 'TaxInvoice'
    };
    const formatName = labelMap[formatKey];
    
    // Generate CSV content
    const headers = ['Product Code', 'Description', 'Unit', 'Details', 'Qty', 'Price', 'Discount', 'Tax', 'Further Tax', 'Total'];
    const rows = data.items.map(item => [
      item.productCode,
      item.description,
      item.unit,
      item.unitDetails,
      item.quantity,
      item.price,
      item.discount,
      item.tax,
      item.furtherTax,
      (item.quantity * item.price) - item.discount + item.tax + item.furtherTax
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Invoice_${formatName}_${data.invoiceNumber || 'draft'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!selectedTemplateForPdf) return;

    const timer = setTimeout(() => {
      const element = document.getElementById('local-printable-container');
      if (element) {
        const activeT = templates.find(t => t.template_id === selectedTemplateForPdf) || templates[0];
        const opt = {
          margin: 0,
          filename: `Invoice_${activeT.template_name.replace(/\s+/g, '_')}_${data.invoiceNumber || 'Draft'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { 
            unit: 'mm', 
            format: activeT.paper_size === 'Thermal' ? [80, 200] : 'a4', 
            orientation: activeT.orientation?.toLowerCase() || 'portrait' 
          }
        };

        const runHtml2Pdf = () => {
          (window as any).html2pdf().from(element).set(opt).save().then(() => {
            setSelectedTemplateForPdf(null);
          }).catch((err: any) => {
            console.error("PDF generation failed:", err);
            setSelectedTemplateForPdf(null);
          });
        };

        if (!(window as any).html2pdf) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = runHtml2Pdf;
          document.head.appendChild(script);
        } else {
          runHtml2Pdf();
        }
      } else {
        setSelectedTemplateForPdf(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedTemplateForPdf, templates, data.invoiceNumber]);

  const selectedCustomer = sampleCustomers.find(c => c.id === selectedCustomerId) || null;

  const addItem = () => {
    // Prevent adding new item if there's an existing empty item
    const hasEmptyItem = data.items.some(item => !item.productCode);
    if (hasEmptyItem) {
      setAlertModal({ isOpen: true, message: 'Please fill in the current product details (Product Code) before adding a new row.' });
      return;
    }

    const id = crypto.randomUUID();
    const newItem: InvoiceItem = {
      id,
      productCode: '',
      description: '',
      unit: '',
      unitDetails: '',
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 0,
      furtherTax: 0
    };
    onChange({ ...data, items: [...data.items, newItem] });
    setLastAddedId(id);

    // Auto-scroll to bottom after state update
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const removeItem = (id: string) =>
    onChange({ ...data, items: data.items.filter((item) => item.id !== id) });

  const updateItem = (id: string, updates: Partial<InvoiceItem>) =>
    onChange({ ...data, items: data.items.map((item) => (item.id === id ? { ...item, ...updates } : item)) });

  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
  const taxAmount = (subtotal * data.taxRate) / 100;
  const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
  const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });




  const filteredItems = data.items.filter(item =>
    item.productCode.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(tableSearchQuery.toLowerCase())
  );



  // ── Action Handlers ──
  const handleNewInvoice = () => {
    setConfirmModal({ isOpen: true, type: 'new' });
  };

  const doNewInvoice = () => {
    onChange({
      invoiceNumber: 'INV-' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      senderName: '',
      senderAddress: '',
      customerName: '',
      customerAddress: '',
      subject: '',
      reference: '',
      productCode: '',
      remarks: '',
      type: 'Sale Invoice',
      items: [],
      taxRate: 0,
      discountPercentage: 0,
      discountAmount: 0,
      shippingCharges: 0,
      roundOff: 0,
      receivedAmount: 0,
      bankAccount: '',
      notes: '',
      salesPerson: '',
      department: ''
    });
    setSelectedCustomerId('');
    setErrors({});
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    const toastMsgs: string[] = [];
    
    if (!selectedCustomerId) {
      newErrors.customer = 'Customer is required';
      toastMsgs.push('Customer Selection is required');
    }
    
    if (data.items.length === 0) {
      newErrors.items = 'At least one item is required';
      toastMsgs.push('At least one Product Item row is required');
    } else {
      data.items.forEach((item, idx) => {
        const rowNum = idx + 1;
        const rowErrFields: string[] = [];
        if (!item.productCode) {
          newErrors[`item_${item.id}`] = 'Product Code is required';
          rowErrFields.push('Product Code');
        }
        if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity) || item.quantity <= 0) {
          newErrors[`qty_${item.id}`] = 'Quantity is required';
          rowErrFields.push('Quantity (must be > 0)');
        }
        if (rowErrFields.length > 0) {
          toastMsgs.push(`Row ${rowNum}: ${rowErrFields.join(', ')} is required`);
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToastMessageData({
        isOpen: true,
        messages: toastMsgs
      });
      setTimeout(() => {
        const firstInvalid = document.querySelector('[data-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inputEl = firstInvalid.querySelector('input, select, textarea') || firstInvalid;
          if (inputEl instanceof HTMLElement) {
            inputEl.focus();
          }
        }
      }, 100);
      return;
    }

    if (onSave) {
      onSave(data);
    } else {
      setAlertModal({
        isOpen: true,
        title: 'Invoice Saved',
        message: 'Invoice ' + data.invoiceNumber + ' has been saved successfully!',
        variant: 'info'
      });
    }
  };

  const getMappedInvoice = (): Invoice => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
    const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

    const initials = data.customerName ? data.customerName.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : 'IV';
    const colors = ['#2759CD', '#10B981', '#F59E0B', '#8B5CF6', '#EE4932', '#0EA5E9', '#EC4899', '#14B8A6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return {
      id: data.invoiceNumber || 'INV-' + Math.floor(1000 + Math.random() * 9000),
      customer: data.customerName || 'Unnamed Customer',
      customerInitials: initials,
      customerColor: randomColor,
      issueDate: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      amount: `Rs. ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: netPayable,
      status: 'Unposted',
      payment: 'Net 30',
      type: data.type || 'Sale Invoice'
    };
  };

  const handleClose = () => {
    setConfirmModal({ isOpen: true, type: 'close' });
  };

  const doClose = () => {
    onViewChange?.('dashboard');
  };


  // Section header helper
  const SectionHeader = ({ title, badge, className = "", icon: Icon }: { title: string; badge?: string; className?: string; icon?: any }) => (
    <div className={`px-4 py-2.5 flex items-center justify-between text-white bg-brand-primary ${className}`}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="w-3.5 h-3.5 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        <h3 className="text-[11px] font-black tracking-wide">{title}</h3>
        {badge && (
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold invoice-card-badge">
            {badge}
          </span>
        )}
      </div>
    </div>
  );

  const getActiveDefaultTemplate = () => {
    const normType = data.type === 'Sale Return' ? 'Sales Return' : 'Sales Invoice';
    return templates.find(t => t.is_default && t.is_active && t.document_type === normType) ||
           templates.find(t => t.is_active && t.document_type === normType) ||
           templates[0];
  };

  const getFormatFromTemplateId = (templateId: string) => {
    if (templateId.includes('-1')) return 'retail';
    if (templateId.includes('-2')) return 'wologo';
    if (templateId.includes('-3')) return 'delivery';
    if (templateId.includes('-4')) return 'tax';
    return 'retail';
  };

  const activeT = getActiveDefaultTemplate();
  const activeFormat = activeT ? getFormatFromTemplateId(activeT.template_id) : 'retail';

  const activePdfT = selectedTemplateForPdf 
    ? (templates.find(t => t.template_id === selectedTemplateForPdf) || templates[0]) 
    : (templates.find(t => t.is_default) || templates[0]);
  const isThermal = activePdfT?.paper_size === 'Thermal';

  const validateInvoiceForExport = () => {
    if (!selectedCustomerId) {
      setAlertModal({ isOpen: true, message: 'Please select a Customer before printing or exporting.' });
      return false;
    }
    if (!data.items || data.items.length === 0) {
      setAlertModal({ isOpen: true, message: 'Please add at least one product before printing or exporting.' });
      return false;
    }
    return true;
  };

  return (<>
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .no-print, .no-print * {
          display: none !important;
        }
        aside, nav, header {
          display: none !important;
        }
        body {
          background: white !important;
          color: black !important;
        }
        .min-h-screen {
          background: white !important;
          padding: 0 !important;
          min-height: auto !important;
        }
        .max-w-7xl {
          max-width: 100% !important;
        }
        /* Make inputs look like flat text */
        input, textarea, select {
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          appearance: none !important;
          color: black !important;
        }
        /* Hide buttons or interactive elements */
        button, .btn {
          display: none !important;
        }
      }
    `}} />
    <div className="min-h-full p-6 space-y-5 font-sans [&_input]:shadow-none [&_select]:shadow-none [&_textarea]:shadow-none bg-[#F4F7FD]">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="relative z-50 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6"
          style={{ borderColor: '#E2E8F0' }}>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-4 text-brand-dark">
              Sales Invoice
              <span className="h-8 w-[1px] bg-brand-dark-20" />
              <div className="flex flex-col">
                <span className="font-medium text-base opacity-40 leading-tight">#{data.invoiceNumber}</span>
              </div>
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Static Status Label remains on the left */}
              <div className="flex items-center gap-2 rounded-xl border px-3 py-1 bg-slate-50 border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[10px] font-bold text-slate-500">Unposted</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap no-print">
            <Button
              onClick={handleNewInvoice}
              variant="primary"
              icon={Plus}
              className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm"
              size="md"
            >
              New Invoice
            </Button>

            <Button
              variant="primary"
              icon={Save}
              onClick={handleSave}
              size="md"
            >
              Save
            </Button>

            {/* Multi-Split Print & Export Buttons */}
            {(() => {
              const isReturn = data.type === 'Sale Return';
              const splitButtonsConfig = [
                { id: 'default', label: 'Print', templateId: activeT?.template_id || (isReturn ? 'srt-1' : 'si-1'), formatKey: activeFormat, isAvailable: !!activeT },
                { id: 'retail', label: 'Retail Print', templateId: isReturn ? 'srt-1' : 'si-1', formatKey: 'retail', isAvailable: templates.find(t => t.template_id === (isReturn ? 'srt-1' : 'si-1'))?.is_active },
                { id: 'delivery', label: 'Delivery', templateId: isReturn ? 'srt-3' : 'si-3', formatKey: 'delivery', isAvailable: templates.find(t => t.template_id === (isReturn ? 'srt-3' : 'si-3'))?.is_active },
                { id: 'tax', label: 'Tax Invoice', templateId: isReturn ? 'srt-4' : 'si-4', formatKey: 'tax', isAvailable: templates.find(t => t.template_id === (isReturn ? 'srt-4' : 'si-4'))?.is_active }
              ];

              return splitButtonsConfig
                .filter(btn => btn.isAvailable)
                .map(btn => (
                  <div key={btn.id} className="relative flex items-center bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <button
                      type="button"
                      onClick={() => {
                        if (!validateInvoiceForExport()) return;

                        // Update default template in settings/state
                        const updated = templates.map(t => ({
                          ...t,
                          is_default: t.template_id === btn.templateId
                        }));
                        setTemplates(updated);
                        localStorage.setItem('print_templates', JSON.stringify(updated));

                        setTimeout(() => {
                          if (onPrint) {
                            onPrint(getMappedInvoice(), btn.templateId);
                          } else {
                            window.print();
                          }
                        }, 50);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors border-none bg-transparent rounded-l-lg cursor-pointer h-9"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      {btn.label}
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200" />
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === btn.id ? null : btn.id)}
                      className="px-2 py-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors border-none bg-transparent rounded-r-lg cursor-pointer flex items-center justify-center h-9 split-button-trigger"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === btn.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          className="absolute right-0 top-10 z-30 bg-white rounded-lg border p-1 w-32 shadow-md split-button-dropdown"
                          style={{ borderColor: '#E2E8F0' }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              if (!validateInvoiceForExport()) return;

                              // Update default template
                              const updated = templates.map(t => ({
                                ...t,
                                is_default: t.template_id === btn.templateId
                              }));
                              setTemplates(updated);
                              localStorage.setItem('print_templates', JSON.stringify(updated));

                              setSelectedTemplateForPdf(btn.templateId);
                            }}
                            className="w-full text-left px-2 py-1.5 text-[10px] font-bold hover:bg-slate-50 rounded transition-all flex items-center gap-2 text-slate-700 cursor-pointer border-none bg-transparent"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            PDF Document
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              if (!validateInvoiceForExport()) return;

                              // Update default template
                              const updated = templates.map(t => ({
                                ...t,
                                is_default: t.template_id === btn.templateId
                              }));
                              setTemplates(updated);
                              localStorage.setItem('print_templates', JSON.stringify(updated));

                              handleDownloadExcelForFormat(btn.formatKey as any);
                            }}
                            className="w-full text-left px-2 py-1.5 text-[10px] font-bold hover:bg-slate-50 rounded transition-all flex items-center gap-2 text-slate-700 cursor-pointer border-none bg-transparent"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Excel (CSV)
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ));
            })()}

            <Button
              variant="white"
              icon={X}
              onClick={handleClose}
              size="md"
            >
              Close
            </Button>
          </div>
        </div>

        <div className="space-y-5">

          {/* ── General Information + Client Profile (Side-by-Side Cards) ── */}
          <div className="flex gap-4 items-stretch">

            {/* Left Column: General Information */}
            <Card className="flex-1 relative z-40 p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <SectionHeader title="General Information" badge="Identity Layer" className="rounded-t-xl" icon={FileText} />
              <div className="p-4 space-y-3">
                {/* Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  {docSettings.fields['Customer'] && (
                    <div className="lg:col-span-5">
                      <ComboBox
                        variant="compact"
                        label="Customer *"
                        placeholder="Search Customer..."
                        value={selectedCustomerId}
                        options={sampleCustomers}
                        minQueryLength={3}
                        error={errors.customer}
                        onChange={(id) => {
                          setSelectedCustomerId(id);
                          if (errors.customer) {
                            setErrors(prev => {
                              const copy = { ...prev };
                              delete copy.customer;
                              return copy;
                            });
                          }
                          const customer = sampleCustomers.find(c => c.id === id);
                          if (customer) {
                            onChange({ ...data, customerName: customer.name, customerAddress: customer.fullAddress });
                          }
                        }}
                      />
                    </div>
                  )}
                  {docSettings.fields['Issue Date'] && (
                    <div className="lg:col-span-2">
                      <Input variant="compact" label="Issue Date" type="date" value={data.date}
                        onChange={(e) => onChange({ ...data, date: e.target.value })} />
                    </div>
                  )}
                  {docSettings.fields['Invoice ID'] && (
                    <div className="lg:col-span-2">
                      <Input variant="compact" label="Invoice ID" className="font-mono text-brand-primary"
                        value={data.invoiceNumber} onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })}
                        readOnly={codeSetting.mode === 'auto'} />
                    </div>
                  )}
                  {docSettings.fields['Reference'] && (
                    <div className="lg:col-span-2">
                      <Input variant="compact" label="Reference" placeholder="PO-2026-004" value={data.reference}
                        onChange={(e) => onChange({ ...data, reference: e.target.value })} />
                    </div>
                  )}
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  {docSettings.fields['Customer Address'] && (
                    <div className="lg:col-span-5">
                      <Input variant="compact" label="Customer Address" placeholder="Street, city, country..." value={data.customerAddress || ''} readOnly />
                    </div>
                  )}
                  {docSettings.fields['Due Date'] && (
                    <div className="lg:col-span-2">
                      <Input variant="compact" label="Due Date" type="date" value={data.dueDate}
                        onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
                    </div>
                  )}
                  {docSettings.fields['Invoice Type'] && (
                    <div className="lg:col-span-2">
                      <Input
                        variant="compact"
                        label="Invoice Type"
                        value="Sale Invoice"
                        readOnly
                      />
                    </div>
                  )}
                  {docSettings.fields['Department'] && (
                    <div className="lg:col-span-2">
                      <Select
                        variant="compact"
                        label="Department"
                        value={data.department || ''}
                        onChange={(e) => onChange({ ...data, department: e.target.value })}
                        options={departmentOptions}
                      />
                    </div>
                  )}
                </div>

                {/* Row 3 – Sales Person */}
                {docSettings.fields['Sales Person'] && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-3">
                    <div className="lg:col-span-2">
                      <Select
                        variant="compact"
                        label="Sales Person"
                        value={data.salesPerson || ''}
                        onChange={(e) => onChange({ ...data, salesPerson: e.target.value })}
                        options={[
                          { value: '', label: 'Select Sales Person' },
                          { value: 'SP001', label: 'SP001-Ahmed Ali' },
                          { value: 'SP002', label: 'SP002-Hassan Khan' },
                          { value: 'SP003', label: 'SP003-Usman Malik' },
                          { value: 'SP004', label: 'SP004-Bilal Raza' },
                          { value: 'SP005', label: 'SP005-Zara Noor' },
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Right Column: Independent Client Profile Card */}
            <AnimatePresence mode="wait">
              {selectedCustomer ? (
                <motion.div
                  key={selectedCustomer.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-[240px] shrink-0 bg-white rounded-xl border overflow-hidden"
                  style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
                >
                  {/* Header */}
                  <div className="px-3 py-2.5 flex items-center justify-between bg-brand-primary">
                    <span className="text-[11px] font-black text-white tracking-wide flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-white" /> Customer Profile
                    </span>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider ${selectedCustomer.status === 'active' ? 'invoice-badge-active' :
                      selectedCustomer.status === 'overdue' ? 'invoice-badge-overdue' :
                        'invoice-badge-inactive'
                      }`}>{selectedCustomer.status}</div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3 bg-gradient-to-b from-[#EFF5FC]/60 to-white">
                    {[
                      { label: 'NTN', value: selectedCustomer.ntn },
                      { label: 'STRN', value: selectedCustomer.strn },
                      { label: 'Province', value: (selectedCustomer as any).province },
                      { label: 'Registration', value: (selectedCustomer as any).registrationType },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 tracking-wider">{row.label}</span>
                        <span className="text-[10px] font-semibold font-mono text-slate-700">{row.value}</span>
                      </div>
                    ))}

                    <div className="h-[1px] bg-slate-200/60 my-1" />

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider">Credit Limit (Rs.)</span>
                      <span className="text-[11px] font-semibold text-brand-primary">{selectedCustomer.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider">Current Balance (Rs.)</span>
                      <span className={`text-[11px] font-semibold ${selectedCustomer.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {selectedCustomer.balance > 0 ? `${selectedCustomer.balance.toLocaleString()}` : 'Clear'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-[240px] shrink-0 bg-white rounded-xl border flex flex-col items-center justify-center gap-2 py-10"
                  style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-200" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 text-center tracking-widest leading-relaxed">
                    Select Customer<br />To View Profile
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-1">
            {/* ── Scanner Bar ── */}
            <div className="relative z-30">
              <div className="w-[31%]">
                <ComboBox
                  variant="compact"
                  placeholder="Search Product Code/Barcode..."
                  value=""
                  icon={Search}
                  options={sampleProducts}
                  minQueryLength={3}
                  onChange={(id) => {
                    const prod = sampleProducts.find(p => p.id === id);
                    if (prod) {
                      const newId = Math.random().toString(36).substr(2, 9);
                      const newItem: InvoiceItem = {
                        id: newId,
                        productCode: prod.id,
                        description: prod.name,
                        unit: 'pcs',
                        unitDetails: prod.subtitle || '',
                        quantity: 1,
                        price: parseFloat(prod.subtitle?.split('Rs. ')[1] || '0'),
                        discount: 0,
                        tax: 0,
                        furtherTax: 0,
                      };
                      onChange({ ...data, items: [...data.items, newItem] });
                      setLastAddedId(newId);
                    }
                  }}
                />
              </div>
            </div>

            {/* ── Transaction Entries ── */}
            <Card className="overflow-hidden w-full max-w-full p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="px-4 py-2.5 flex items-center justify-between text-white bg-brand-primary">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-white" />
                  <h3 className="text-[11px] font-black tracking-wide">Transaction Entries</h3>
                  <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold invoice-card-badge">
                    {filteredItems.length} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                    <input
                      value={tableSearchQuery}
                      onChange={e => setTableSearchQuery(e.target.value)}
                      placeholder="Search Entries..."
                      className="h-7 pl-8 pr-3 rounded-lg text-[11px] font-medium border outline-none w-52 placeholder:text-white/40 invoice-header-search-input"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="md"
                    className="border bg-white/10 border-white/20 text-white hover:bg-white/20"
                    icon={Plus}
                    onClick={addItem}
                  >
                    Add Item
                  </Button>
                </div>
              </div>

              <ScrollArea
                className="custom-scrollbar w-full max-w-full"
                maxHeight="310px"
                ref={scrollContainerRef}
                style={{ overscrollBehavior: 'contain', overflowX: 'auto' }}
              >
                <table className={`w-full relative table-fixed ${tableMinW}`}>
                  <thead className="sticky top-0 bg-white z-20">
                    <tr className="text-[10px] font-black tracking-widest bg-white">
                      <th className="px-3 py-2.5 text-left w-10 whitespace-nowrap border-b border-[#E2E8F0]">#</th>
                      {docSettings.columns['Product Code'] && <th className="px-3 py-2.5 text-left w-36 whitespace-nowrap border-b border-[#E2E8F0]">Product Code</th>}
                      {docSettings.columns['Description'] && <th className={`px-3 py-2.5 text-left border-b border-[#E2E8F0] ${descriptionWidth} whitespace-nowrap`}>Description</th>}
                      {docSettings.columns['Unit'] && <th className={`px-3 py-2.5 text-left ${unitWidth} border-b border-[#E2E8F0] whitespace-nowrap`}>Unit</th>}
                      {docSettings.columns['Details'] && <th className={`px-3 py-2.5 text-left ${detailsWidth} border-b border-[#E2E8F0] whitespace-nowrap`}>Details</th>}
                      {docSettings.columns['Qty'] && <th className={`px-3 py-2.5 text-left ${qtyWidth} border-b border-[#E2E8F0] whitespace-nowrap`}>Qty</th>}
                      {docSettings.columns['Price'] && <th className={`px-3 py-2.5 text-left ${priceWidth} border-b border-[#E2E8F0] whitespace-nowrap`}>Price (Rs.)</th>}
                      {docSettings.columns['Discount'] && <th className={`px-3 py-2.5 text-left ${discountWidth} border-b border-[#E2E8F0] whitespace-nowrap`}>Discount (Rs.)</th>}
                      {docSettings.columns['Tax'] && <th className={`px-3 py-2.5 text-left ${taxWidth} border-b border-[#E2E8F0] whitespace-nowrap`}>Tax (Rs.)</th>}
                      {docSettings.columns['Further Tax'] && <th className={`px-3 py-2.5 text-left ${furtherTaxWidth} border-b border-[#E2E8F0] whitespace-nowrap`}>Further Tax (Rs.)</th>}
                      {docSettings.columns['Total'] && <th className={`px-4 py-2.5 text-left ${totalWidth} border-b border-[#E2E8F0] whitespace-nowrap`}>Total (Rs.)</th>}
                      <th className="px-3 py-2.5 w-12 border-b border-[#E2E8F0]" />
                    </tr>
                  </thead>
                  <tbody className="invoice-recent-table-body">
                    <AnimatePresence mode="popLayout">
                      {filteredItems.map((item, idx) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          layout
                          className="group hover:bg-slate-50/60 transition-colors border-b border-[#E2E8F0] last:border-0"
                        >
                          <td className="px-3 py-3 text-[10px] font-medium text-black transition-colors text-center">{idx + 1}</td>
                          {docSettings.columns['Product Code'] && (
                            <td className="px-2 py-3">
                              <ComboBox
                                autoFocus={item.id === lastAddedId}
                                variant="compact"
                                placeholder="Search Code..."
                                value={item.productCode}
                                options={sampleProducts.map(p => ({ id: p.id, name: p.id, subtitle: p.name }))}
                                minQueryLength={3}
                                error={errors[`item_${item.id}`]}
                                hideErrorText
                               onChange={(id) => {
                                  const prod = sampleProducts.find(p => p.id === id);
                                  if (prod) {
                                    const parsedPrice = parseFloat(prod.subtitle?.split('Rs. ')[1] || '0') || 450;
                                    updateItem(item.id, {
                                      productCode: prod.id,
                                      description: prod.name,
                                      price: parsedPrice
                                    });
                                    if (errors[`item_${item.id}`]) {
                                      setErrors(prev => {
                                        const copy = { ...prev };
                                        delete copy[`item_${item.id}`];
                                        return copy;
                                      });
                                    }
                                    setLastAddedId(null);
                                  }
                                }}
                              />
                            </td>
                          )}
                          {docSettings.columns['Description'] && (
                            <td className="px-2 py-3">
                              <Input
                                variant="transparent"
                                readOnly
                                placeholder="Item Description"
                                className="!text-[12px] font-normal text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                value={item.description}
                              />
                            </td>
                          )}
                          {docSettings.columns['Unit'] && (
                            <td className="px-2 py-3">
                              <Input
                                variant="compact"
                                placeholder="Unit"
                                className="text-center !bg-white border-slate-200 !text-[12px] font-normal text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                              />
                            </td>
                          )}
                          {docSettings.columns['Details'] && (
                            <td className="px-2 py-3">
                              <Input
                                variant="compact"
                                placeholder="Unit Details..."
                                className="!bg-white border-slate-200 !text-[12px] font-normal text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                value={item.unitDetails}
                                onChange={(e) => updateItem(item.id, { unitDetails: e.target.value })}
                              />
                            </td>
                          )}
                          {docSettings.columns['Qty'] && (
                            <td className="px-2 py-3">
                              <Input
                                type="number"
                                variant="compact"
                                className="text-center !bg-white border-slate-200 !text-[12px] font-normal text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                value={item.quantity}
                                error={errors[`qty_${item.id}`]}
                                hideErrorText
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  updateItem(item.id, { quantity: val });
                                  if (val > 0 && errors[`qty_${item.id}`]) {
                                    setErrors(prev => {
                                      const copy = { ...prev };
                                      delete copy[`qty_${item.id}`];
                                      return copy;
                                    });
                                  }
                                }}
                              />
                            </td>
                          )}
                          {docSettings.columns['Price'] && (
                            <td className="px-2 py-3">
                              <Input
                                type="number"
                                variant="compact"
                                className="text-right !bg-white border-slate-200 !text-[12px] font-normal text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                              />
                            </td>
                          )}
                          {docSettings.columns['Discount'] && (
                            <td className="px-2 py-3">
                              <Input
                                type="number"
                                variant="compact"
                                className="text-center font-normal !bg-white border-slate-200 !text-[12px] text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                value={item.discount}
                                onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                              />
                            </td>
                          )}
                          {docSettings.columns['Tax'] && (
                            <td className="px-2 py-3">
                              <Input
                                type="number"
                                variant="compact"
                                className="text-center font-normal !bg-white border-slate-200 !text-[12px] text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                value={item.tax}
                                onChange={(e) => updateItem(item.id, { tax: parseFloat(e.target.value) || 0 })}
                              />
                            </td>
                          )}
                          {docSettings.columns['Further Tax'] && (
                            <td className="px-2 py-3">
                              <Input
                                type="number"
                                variant="compact"
                                className="text-center font-normal !bg-white border-slate-200 !text-[12px] text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                value={item.furtherTax}
                                onChange={(e) => updateItem(item.id, { furtherTax: parseFloat(e.target.value) || 0 })}
                              />
                            </td>
                          )}
                          {docSettings.columns['Total'] && (
                            <td className="px-4 py-3 text-left font-normal text-[12px] text-slate-700">
                              {fmt((item.quantity * item.price) - item.discount + item.tax + item.furtherTax)}
                            </td>
                          )}
                          <td className="px-1 py-3 text-center">
                            <Button
                              onClick={() => removeItem(item.id)}
                              variant="ghost"
                              size="xs"
                              icon={Trash2}
                              title="Delete Item"
                              className="!px-1 !text-red-500"
                            />
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>

                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={visibleColsCount} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <Plus className="w-12 h-12" />
                            <p className="text-[11px] font-black tracking-widest">
                              {data.items.length === 0 ? 'No entries found — click "Add item" to start' : 'No items match your search'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {/* Sticky Summary Footer */}
                  {data.items.length > 0 && (
                    <tfoot className="sticky bottom-0 z-10 bg-white border-t border-[#E2E8F0] shadow-none" style={{ boxShadow: 'none' }}>
                      <tr>
                        <td className="px-3 py-3 text-[10px] text-black text-center font-bold">Σ</td>
                        {summaryColSpan > 0 && (
                          <td colSpan={summaryColSpan} className="px-4 py-3 text-[10px] text-black tracking-widest text-right pr-10 font-bold">Total Summary</td>
                        )}
                        {docSettings.columns['Qty'] && (
                          <td className="px-2 py-3 text-center text-[12px] text-black font-bold">
                            {data.items.reduce((sum, i) => sum + i.quantity, 0)}
                          </td>
                        )}
                        {docSettings.columns['Price'] && (
                          <td className="px-2 py-3 text-right text-[12px] text-black font-bold">
                            {/* Price total removed as requested */}
                          </td>
                        )}
                        {docSettings.columns['Discount'] && (
                          <td className="px-2 py-3 text-center text-[12px] text-black font-bold">
                            {fmt(data.items.reduce((sum, i) => sum + i.discount, 0))}
                          </td>
                        )}
                        {docSettings.columns['Tax'] && (
                          <td className="px-2 py-3 text-center text-[12px] text-black font-bold">
                            {fmt(data.items.reduce((sum, i) => sum + i.tax, 0))}
                          </td>
                        )}
                        {docSettings.columns['Further Tax'] && (
                          <td className="px-2 py-3 text-center text-[12px] text-black font-bold">
                            {fmt(data.items.reduce((sum, i) => sum + i.furtherTax, 0))}
                          </td>
                        )}
                        {docSettings.columns['Total'] && (
                          <td className="px-4 py-3 text-left text-[12px] text-black font-bold">
                            {fmt(subtotal)}
                          </td>
                        )}
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </ScrollArea>
            </Card>
          </div>

          {/* ── Bottom Tier ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left: Notes + Attachments (Side-by-Side) */}
            {(docSettings.fields['Notes & Special Terms'] || docSettings.fields['Document Attachments']) ? (
              <div className={`lg:col-span-8 grid grid-cols-1 ${docSettings.fields['Notes & Special Terms'] && docSettings.fields['Document Attachments'] ? 'md:grid-cols-2' : ''} gap-6`}>

                {/* Notes */}
                {docSettings.fields['Notes & Special Terms'] && (
                  <Card className="overflow-hidden flex flex-col h-full p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                    <div className="pt-3 px-3 pb-2 space-y-2 flex-1 flex flex-col">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-medium text-black">Notes & Special Terms</p>
                      </div>
                      <div className="w-full flex-1">
                        <TextArea placeholder="Enter Payment Terms, Bank Details, Or Special Instructions..." className="h-full min-h-[100px] !text-[12px]"
                          value={data.notes} onChange={(e) => onChange({ ...data, notes: e.target.value })} />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Attachments */}
                {docSettings.fields['Document Attachments'] && (
                  <Card className="overflow-hidden flex flex-col h-full p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv"
                      onChange={(e) => {
                        if (e.target.files) {
                          const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'];
                          const selectedFiles = Array.from(e.target.files);
                          const validFiles = selectedFiles.filter(file => {
                            const ext = file.name.split('.').pop()?.toLowerCase();
                            return ext && allowedExtensions.includes(ext);
                          });

                          if (validFiles.length !== selectedFiles.length) {
                            alert("Only Image, PDF, Excel, and Word files are allowed!");
                          }

                          if (validFiles.length > 0) {
                            const newFiles = validFiles.map(f => ({
                              name: f.name,
                              size: (f.size / 1024 / 1024).toFixed(1) + ' MB'
                            }));
                            setFiles(prevFiles => [...prevFiles, ...newFiles]);
                            setUploadSuccess(true);
                            setTimeout(() => setUploadSuccess(false), 3000);
                          }
                        }
                      }}
                    />

                    <div className="pt-3 px-3 pb-2 space-y-2 flex-1 flex flex-col">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-medium text-black">Document Attachments</p>
                        <span className="text-[10px] font-medium text-slate-400">
                          {uploadSuccess ? 'Upload Success!' : `${files.length} ${files.length === 1 ? 'file' : 'files'}`}
                        </span>
                      </div>
                      <div className="w-full flex-1">
                        {/* Upload Zone */}
                        <div
                          className={`border border-dashed rounded-[12px] bg-white relative h-[80px] transition-colors flex flex-col ${files.length === 0 ? 'items-center justify-center py-2' : 'items-stretch justify-start p-1'
                            }`}
                          style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
                        >
                          {files.length === 0 ? (
                            <>
                              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-slate-200 mb-1" style={{ boxShadow: 'none' }}>
                                <div className="w-5 h-5 rounded-full bg-[#F0F7FF] flex items-center justify-center">
                                  <Upload className="w-3 h-3 text-[#2759CD]" />
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="text-[9px] font-black text-slate-800">Drop Files</p>
                                <p className="text-[6px] font-medium text-slate-400">IMG, PDF, Excel, Word</p>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-0.5">
                              <AnimatePresence>
                                {files.map((file, idx) => (
                                  <motion.div
                                    key={file.name + '-' + idx}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative flex items-center justify-between bg-slate-50 border rounded-lg p-1 group shrink-0"
                                    style={{ borderColor: '#E2E8F0' }}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 pr-5">
                                      <div className="w-5 h-5 rounded bg-[#F0F7FF] flex items-center justify-center shrink-0">
                                        <Upload className="w-2.5 h-2.5 text-[#2759CD]" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[8.5px] font-bold text-slate-700 truncate leading-tight" title={file.name}>
                                          {file.name}
                                        </p>
                                        <p className="text-[7.5px] font-medium text-slate-400 leading-none mt-0.5">
                                          {file.size}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(idx);
                                      }}
                                      className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <X className="w-2 h-2" />
                                    </button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {/* Right Side: Spacer or extra space if needed */}
                        <div className="hidden md:block" />
                      </div>

                      {/* Compact Buttons */}
                      <div className="flex justify-end gap-2 pt-0.5 border-t border-slate-50">
                        <Button variant="primary"
                          size="md"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <div className="lg:col-span-8" />
            )}

            {/* Right: Financial Matrix */}
            <div className="lg:col-span-4 flex flex-col h-full">
              <Card className="overflow-hidden flex flex-col h-full p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>

                <div className="p-3 flex-1 flex flex-col gap-2">
                  {/* Discount Section */}
                  {docSettings.fields['Discount (%)'] && (
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-8">
                        <span className="text-[11px] font-bold text-black">Discount (%)</span>
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          variant="compact"
                          className="text-right"
                          value={data.discountPercentage}
                          onChange={(e) => onChange({ ...data, discountPercentage: parseFloat(e.target.value) || 0, discountAmount: 0 })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Shipping Charges */}
                  {docSettings.fields['Shipping Charges'] && (
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-8">
                        <span className="text-[11px] font-bold text-black">Shipping Charges</span>
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          variant="compact"
                          className="text-right"
                          value={data.shippingCharges}
                          onChange={(e) => onChange({ ...data, shippingCharges: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Round Off */}
                  {docSettings.fields['Round Off'] && (
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-8">
                        <span className="text-[11px] font-bold text-black">Round Off</span>
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          variant="compact"
                          className="text-right"
                          value={data.roundOff}
                          onChange={(e) => onChange({ ...data, roundOff: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="h-[1px] bg-slate-100 my-0.5" />

                  {/* Gross */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-black">Gross Subtotal</span>
                    <span className="text-[12px] font-normal text-slate-700">{fmt(subtotal)}</span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-black">Tax</span>
                      <span className="text-[9px] text-slate-400">Calculated ({data.taxRate}%)</span>
                    </div>
                    <span className="text-[12px] font-normal text-slate-700">{fmt(taxAmount)}</span>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-0.5" />

                  {/* Net */}
                  <div className="flex justify-between items-center px-1 py-1">
                    <span className="text-[11px] font-bold text-slate-700">Net Total (Rs.)</span>
                    <span className="text-[16px] font-bold text-brand-primary">{fmt(netPayable)}</span>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>

    {/* ── Hidden Printable Invoice for Direct Download ── */}
    <div className="printable-hidden-wrapper">
      <div id="local-printable-container" className="printable-invoice-container">
        {isThermal && (
          <style dangerouslySetInnerHTML={{ __html: `
            #local-printable-container {
              width: 80mm !important;
              padding: 12px !important;
              font-size: 9px !important;
              font-family: 'Inter', sans-serif !important;
            }
            #local-printable-container .printable-header-flex {
              flex-direction: column !important;
              align-items: center !important;
              text-align: center !important;
              border-bottom: 1px dashed #cbd5e1 !important;
              padding-bottom: 12px !important;
              margin-bottom: 12px !important;
            }
            #local-printable-container .printable-header-right {
              text-align: center !important;
              margin-top: 8px !important;
              width: 100% !important;
            }
            #local-printable-container .printable-billing-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
              border-bottom: 1px dashed #cbd5e1 !important;
              padding-bottom: 12px !important;
              margin-bottom: 12px !important;
            }
            #local-printable-container .printable-items-table {
              margin-bottom: 15px !important;
            }
            #local-printable-container .printable-items-table th,
            #local-printable-container .printable-items-table td {
              padding: 4px 2px !important;
              font-size: 7.5px !important;
            }
            #local-printable-container .printable-totals-wrapper {
              justify-content: center !important;
              width: 100% !important;
            }
            #local-printable-container .printable-totals-container {
              width: 100% !important;
            }
          `}} />
        )}
        {/* Header: Company & Invoice title */}
        <div className="printable-header-flex">
          <div>
            {activePdfT?.logo_url && activePdfT.logo_size > 0 && (
              <img 
                src={activePdfT.logo_url} 
                style={{ height: `${activePdfT.logo_size}px`, objectFit: 'contain', marginBottom: '8px' }} 
                alt="Logo" 
              />
            )}
            <h1 className="printable-sender-title">{data.senderName || 'Antigravity Creative Studio'}</h1>
            <p className="printable-sender-address">
              {data.senderAddress || '452 Innovation Blvd, San Francisco, CA 94107'}
            </p>
          </div>
          <div className="printable-header-right">
            <h2 className="printable-invoice-label">
              {activePdfT?.template_id?.includes('-4') ? 'TAX INVOICE' : 'INVOICE'}
            </h2>
            <p className="printable-invoice-id">#{data.invoiceNumber}</p>
            <div className="printable-invoice-dates">
              <div><strong>Issue Date:</strong> {data.date}</div>
              <div><strong>Due Date:</strong> {data.dueDate}</div>
              <div><strong>Status:</strong> Unposted</div>
            </div>
          </div>
        </div>

        {/* Billing Details Block */}
        <div className="printable-billing-grid">
          <div>
            <h3 className="printable-billing-section-title">From</h3>
            <h4 className="printable-billing-name">{data.senderName || 'Antigravity Creative Studio'}</h4>
            <p className="printable-billing-address">
              {data.senderAddress}
            </p>
          </div>
          <div>
            <h3 className="printable-billing-section-title">Bill To</h3>
            <h4 className="printable-billing-name">{data.customerName || 'Unnamed Customer'}</h4>
            <p className="printable-billing-address">
              {data.customerAddress}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        {/* Line Items Table */}
        <table className="printable-items-table">
          <thead>
            <tr className="printable-table-head-row">
              {['Code', 'Description', 'Unit', 'Qty', 'Rate (Rs.)', 'Tax (Rs.)', 'Discount (Rs.)', 'Total (Rs.)'].map(h => (
                <th key={h} style={{ textAlign: (h === 'Description' || h === 'Code') ? 'left' : 'right' }} className="p-3 text-[9px] font-bold tracking-widest text-[#64748b] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map(item => {
              const itemTotal = (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0);
              return (
                <tr key={item.id} className="printable-table-row">
                  <td style={{ textAlign: 'left' }} className="p-3 text-[#1e293b] font-mono">{item.productCode}</td>
                  <td style={{ textAlign: 'left' }} className="p-3 text-[#475569]">{item.description}</td>
                  <td style={{ textAlign: 'right' }} className="p-3 text-[#64748b]">{item.unit}</td>
                  <td style={{ textAlign: 'right' }} className="p-3 text-[#334155]">{item.quantity}</td>
                  <td style={{ textAlign: 'right' }} className="p-3 text-[#64748b]">{item.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }} className="p-3 text-[#16a34a]">+{item.tax + (item.furtherTax || 0) === 0 ? '0.00' : (item.tax + (item.furtherTax || 0)).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }} className="p-3 text-[#dc2626]">-{item.discount === 0 ? '0.00' : item.discount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }} className="p-3 font-bold text-[#1e293b]">{itemTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="printable-totals-wrapper">
          <div className="printable-totals-container">
            <div className="printable-totals-row">
              <span className="printable-totals-text-muted">Gross Subtotal:</span>
              <span className="printable-totals-val">{fmt(subtotal)}</span>
            </div>
            <div className="printable-totals-row">
              <span className="printable-totals-text-muted">Tax ({data.taxRate}%):</span>
              <span className="printable-totals-val">{fmt(taxAmount)}</span>
            </div>
            {data.discountAmount > 0 && (
              <div className="printable-totals-row">
                <span className="printable-totals-text-muted">Discount:</span>
                <span className="printable-totals-val-discount">-{fmt(data.discountAmount)}</span>
              </div>
            )}
            <div className="printable-totals-row-net">
              <span>Net Total (Rs.):</span>
              <span className="printable-totals-val-net">{fmt(netPayable)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Confirm Modals */}
    <ConfirmModal
      isOpen={confirmModal.isOpen && confirmModal.type === 'new'}
      onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      onConfirm={doNewInvoice}
      title="Create New Invoice?"
      message="Are you sure you want to start a new invoice? All unsaved changes on the current invoice will be lost."
      confirmLabel="Yes, New Invoice"
      variant="warning"
    />
    <ConfirmModal
      isOpen={confirmModal.isOpen && confirmModal.type === 'close'}
      onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      onConfirm={doClose}
      title="Discard Changes?"
      message="Are you sure you want to close the editor? All unsaved changes will be discarded and you will be returned to the dashboard."
      confirmLabel="Yes, Discard"
      variant="warning"
    />
     <AlertModal
      isOpen={alertModal.isOpen}
      onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      title={alertModal.title || "Required Fields Missing"}
      message={alertModal.message}
      variant={alertModal.variant || "warning"}
    />
    <Toast
      isOpen={toastMessageData.isOpen}
      onClose={() => setToastMessageData(prev => ({ ...prev, isOpen: false }))}
      messages={toastMessageData.messages}
    />
  </>
  );
};

export default InvoiceEditorV4;
