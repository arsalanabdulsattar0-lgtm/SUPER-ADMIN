import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Compass, Search, Pencil, Box,
  FileText, Users, LayoutDashboard, Settings, HelpCircle, PlusCircle,
  Tag, TrendingUp, Download, Palette, Info, Keyboard, BarChart3,
  X, Mic, CheckCircle, AlertCircle, Clock, DollarSign, CalendarDays,
  Trash2, Copy, ArrowUpRight, Loader2, ChevronRight, Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  activeView: string;
  onViewChange: (view: string) => void;
}

interface ChartBar {
  label: string;
  value: number;
  color: string;
}

interface AIResult {
  type: 'data' | 'stat' | 'success' | 'error' | 'info';
  icon: LucideIcon;
  color: string;
  title: string;
  subtitle?: string;
  rows?: Array<Record<string, string>>;
  columns?: string[];
  stat?: string;
  chartBars?: ChartBar[];
  actions?: Array<{ label: string; action: () => void }>;
}

interface ParsedCommand {
  intent: string;
  raw: string;
  entities: Record<string, string>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOCAL STORAGE HELPERS — the "database"
   ═══════════════════════════════════════════════════════════════════════════ */

interface StoredInvoice {
  id: string; customer: string; customerInitials: string; customerColor: string;
  issueDate: string; dueDate: string; amount: string; rawAmount: number;
  status: string; payment: string; type: string;
}

interface StoredCustomer {
  name: string; email: string; phone: string; location: string; totalInvoiced: string;
}

function readInvoices(): StoredInvoice[] {
  try {
    const d = localStorage.getItem('invoice_list');
    if (!d) return [];
    const parsed = JSON.parse(d) as any[];
    return parsed.map((inv: any) => ({
      ...inv,
      customer: inv.customer || inv.client || 'Unknown Customer',
      customerInitials: inv.customerInitials || inv.clientInitials || (inv.customer || inv.client || 'UC').slice(0, 2).toUpperCase(),
      customerColor: inv.customerColor || inv.clientColor || '#16a34a',
    }));
  } catch {
    return [];
  }
}

function writeInvoices(data: StoredInvoice[]) {
  try { localStorage.setItem('invoice_list', JSON.stringify(data)); } catch { /* */ }
  window.dispatchEvent(new CustomEvent('ai-sync-data'));
}

function readCustomers(): StoredCustomer[] {
  try { const d = localStorage.getItem('customer_list'); return d ? JSON.parse(d) : []; } catch { return []; }
}

function writeCustomers(data: StoredCustomer[]) {
  try { localStorage.setItem('customer_list', JSON.stringify(data)); } catch { /* */ }
  window.dispatchEvent(new CustomEvent('ai-sync-data'));
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI ENGINE — Natural Language → Intent + Entities
   ═══════════════════════════════════════════════════════════════════════════ */

const NAV_MAP: Record<string, string> = {
  dashboard: 'dashboard1', home: 'dashboard1', main: 'dashboard1', overview: 'dashboard1',
  dashboard2: 'dashboard2', salesmonk: 'dashboard2', businessoverview: 'dashboard2', 'business-overview': 'dashboard2',
  invoices: 'invoices', invoice: 'invoices', bills: 'invoices',
  clients: 'customers', customers: 'customers', client: 'customers', customer: 'customers',
  products: 'products', inventory: 'products', product: 'products',
  settings: 'settings', preferences: 'settings', config: 'settings',
  help: 'help', support: 'help',
  'create invoice': 'add-invoice-v4', 'new invoice': 'add-invoice-v4',
  editor: 'add-invoice-v4',
};

function parseCommand(input: string): ParsedCommand {
  const raw = input.trim();
  const lower = raw.toLowerCase();

  // ── Navigation ──
  const navMatch = lower.match(/^(?:go\s+to|open|navigate\s+to|switch\s+to|take\s+me\s+to)\s+(.+)/);
  if (navMatch) {
    const target = navMatch[1].replace(/[?.!]/g, '').trim();
    return { intent: 'navigate', raw, entities: { target } };
  }

  // ── Create Invoice for X ──
  const createInvMatch = lower.match(/^(?:create|make|new|generate)\s+(?:an?\s+)?invoice\s+(?:for\s+)?(.+)?/);
  if (createInvMatch) {
    return { intent: 'create-invoice', raw, entities: { customerName: createInvMatch[1]?.trim() || '' } };
  }

  // ── Add Customer ──
  const addCustMatch = lower.match(/^(?:add|create|new)\s+(?:a\s+)?(?:customer|client)\s+(.+)/);
  if (addCustMatch) {
    return { intent: 'create-customer', raw, entities: { name: addCustMatch[1].trim() } };
  }

  // ── Add/Edit Product ──
  const addProdMatch = lower.match(/^(?:add|create|new)\s+(?:a\s+)?(?:product|item)\s+([a-z0-9\s\-]+?)\s+price\s+(\d+)/i);
  if (addProdMatch) {
    return { intent: 'create-product', raw, entities: { name: addProdMatch[1].trim(), price: addProdMatch[2] } };
  }
  if (/^(?:add|create|new)\s+(?:a\s+)?(?:product|item|line)/i.test(lower)) {
    return { intent: 'open-product-form', raw, entities: {} };
  }

  const updateProdMatch = lower.match(/update\s+price\s+of\s+(.+?)\s+to\s+(\d+)/i);
  if (updateProdMatch) {
    return { intent: 'update-product-price', raw, entities: { name: updateProdMatch[1].trim(), price: updateProdMatch[2] } };
  }

  const deleteProdMatch = lower.match(/delete\s+product\s+(.+)/i);
  if (deleteProdMatch) {
    return { intent: 'delete-product', raw, entities: { name: deleteProdMatch[1].trim() } };
  }

  // ── Apply Discount ──
  const discountMatch = lower.match(/^(?:apply|set|add)\s+(\d+)%?\s*(?:discount|off)/);
  if (discountMatch) {
    return { intent: 'apply-discount', raw, entities: { percent: discountMatch[1] } };
  }

  // ── Set Due Date ──
  const dueDateMatch = lower.match(/^(?:set|change)\s+due\s*date\s+(?:to\s+)?(.+)/);
  if (dueDateMatch) {
    return { intent: 'set-due-date', raw, entities: { dateStr: dueDateMatch[1].trim() } };
  }
  if (/due\s*date\s+next\s+week/i.test(lower)) {
    return { intent: 'set-due-date', raw, entities: { dateStr: 'next week' } };
  }

  // ── Fill from last invoice ──
  if (/fill\s+(?:from\s+)?last\s+invoice/i.test(lower)) {
    return { intent: 'fill-last-invoice', raw, entities: {} };
  }

  // ── Delete / Remove ──
  const deleteMatch = lower.match(/^(?:delete|remove)\s+(?:invoice\s+)?(?:#?)(\S+)/);
  if (deleteMatch) {
    return { intent: 'delete-invoice', raw, entities: { id: deleteMatch[1].toUpperCase() } };
  }
  if (/^(?:clear|remove)\s+(?:all\s+)?(?:items|products)/i.test(lower)) {
    return { intent: 'clear-items', raw, entities: {} };
  }

  // ── Update NTN ──
  if (/update\s+ntn/i.test(lower)) {
    return { intent: 'update-ntn', raw, entities: {} };
  }


  // ── Search invoice by number ──
  const searchInvMatch = lower.match(/search\s+invoice\s+(.+)/);
  if (searchInvMatch) {
    return { intent: 'find-invoice', raw, entities: { id: searchInvMatch[1].trim() } };
  }
  
  // ── Remove Item ──
  if (/remove\s+item/i.test(lower)) return { intent: 'remove-item', raw, entities: {} };

  // ── Select customer ──
  const selectCustMatch = lower.match(/select\s+(?:customer|client)\s+(.+)/);
  if (selectCustMatch) {
    return { intent: 'select-customer', raw, entities: { customerName: selectCustMatch[1].trim() } };
  }

  // ── Delete customer ──
  const deleteCustMatch = lower.match(/delete\s+(?:customer|client)\s+(.+)/);
  if (deleteCustMatch) {
    return { intent: 'delete-customer', raw, entities: { name: deleteCustMatch[1].trim() } };
  }

  // ── Invoice Actions ──
  if (/mark\s+as\s+paid/i.test(lower)) return { intent: 'mark-paid', raw, entities: {} };
  if (/download\s+invoice/i.test(lower)) return { intent: 'export', raw, entities: {} };
  if (/send\s+invoice/i.test(lower)) return { intent: 'send-invoice', raw, entities: {} };
  if (/edit\s+invoice/i.test(lower)) return { intent: 'edit-invoice', raw, entities: {} };
  if (/duplicate\s+invoice/i.test(lower)) return { intent: 'duplicate-invoice', raw, entities: {} };

  // ── Queries ──
  if (/overdue|late\s+invoices/i.test(lower)) return { intent: 'query-overdue', raw, entities: {} };
  if (/unpaid|pending\s+invoices/i.test(lower)) return { intent: 'query-pending-invoices', raw, entities: {} };
  if (/pending\s+amount|amount\s+pending|how\s+much\s+.*(pending|owed|due)/i.test(lower)) return { intent: 'query-pending-amount', raw, entities: {} };
  if (/revenue|income|earned|total\s+paid/i.test(lower)) return { intent: 'query-revenue', raw, entities: {} };
  if (/top\s+customer|best\s+customer/i.test(lower)) return { intent: 'query-top-customers', raw, entities: {} };
  if (/top\s+product|best\s+product|selling/i.test(lower)) return { intent: 'query-top-products', raw, entities: {} };
  if (/paid\s+invoices/i.test(lower)) return { intent: 'query-paid', raw, entities: {} };
  if (/draft\s+invoices/i.test(lower)) return { intent: 'query-drafts', raw, entities: {} };
  if (/total\s+invoices|how\s+many\s+invoices/i.test(lower)) return { intent: 'query-total-invoices', raw, entities: {} };
  if (/active\s+customer/i.test(lower)) return { intent: 'query-active-customers', raw, entities: {} };

  // ── Find invoice by ID ──
  const findInvMatch = lower.match(/(?:find|search|show|get)\s+(?:invoice\s+)?(?:#?)?(si-\d+|inv-\d+)/i);
  if (findInvMatch) {
    return { intent: 'find-invoice', raw, entities: { id: findInvMatch[1].toUpperCase() } };
  }

  // ── Search customer ──
  const searchCustMatch = lower.match(/(?:search|find)\s+(?:customer|client)\s+(.+)/);
  if (searchCustMatch) {
    return { intent: 'search-customer', raw, entities: { query: searchCustMatch[1].trim() } };
  }

  // ── Sort invoices ──
  if (/sort\s+by\s+(?:highest|largest|biggest)\s*(?:amount)?/i.test(lower)) return { intent: 'sort-highest', raw, entities: {} };
  if (/sort\s+by\s+(?:lowest|smallest)\s*(?:amount)?/i.test(lower)) return { intent: 'sort-lowest', raw, entities: {} };
  if (/filter\s+last\s+30\s+days/i.test(lower)) return { intent: 'filter-30-days', raw, entities: {} };

  // ── Theme ──
  if (/change\s+theme|switch\s+theme/i.test(lower)) return { intent: 'navigate', raw, entities: { target: 'settings' } };

  // ── Export ──
  if (/export|download\s+report/i.test(lower)) return { intent: 'export', raw, entities: {} };

  // ── Save ──
  if (/^save/i.test(lower)) return { intent: 'save', raw, entities: {} };

  // ── Keyboard Shortcuts ──
  if (/shortcut|hotkey/i.test(lower)) return { intent: 'shortcuts', raw, entities: {} };

  // ── How to ──
  if (/how\s+(?:to|do\s+i)\s+(?:create|make)\s+(?:an?\s+)?invoice/i.test(lower)) return { intent: 'help-create-invoice', raw, entities: {} };

  // ── Fallback: try navigation ──
  for (const key of Object.keys(NAV_MAP)) {
    if (lower.includes(key)) return { intent: 'navigate', raw, entities: { target: key } };
  }

  return { intent: 'unknown', raw, entities: {} };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMMAND EXECUTOR — Turns parsed commands into real actions + results
   ═══════════════════════════════════════════════════════════════════════════ */

function executeCommand(
  cmd: ParsedCommand,
  onViewChange: (v: string) => void,
  brandPrimary: string,
): AIResult {
  const invoices = readInvoices();
  const customers = readCustomers();

  switch (cmd.intent) {


    case 'open-product-form':
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-product-form', { detail: {} }));
      }, 100);
      return { type: 'success', icon: Box, color: brandPrimary, title: 'Opening product form', subtitle: 'You can add details there.' };

    case 'create-product': {
      const pName = cmd.entities.name;
      const pPrice = parseFloat(cmd.entities.price);
      try {
        const stored = localStorage.getItem('products_list');
        const prods = stored ? JSON.parse(stored) : [];
        prods.push({ id: crypto.randomUUID(), name: pName, price: pPrice, tax: 0, description: '' });
        localStorage.setItem('products_list', JSON.stringify(prods));
        window.dispatchEvent(new CustomEvent('ai-sync-data'));
        return { type: 'success', icon: Box, color: '#10B981', title: `Created product "${pName}"`, subtitle: `Price set to Rs. ${pPrice}` };
      } catch {
        return { type: 'error', icon: AlertCircle, color: '#EF4444', title: 'Failed to create product' };
      }
    }

    case 'update-product-price': {
      const pName = cmd.entities.name;
      const pPrice = parseFloat(cmd.entities.price);
      try {
        const stored = localStorage.getItem('products_list');
        const prods = stored ? JSON.parse(stored) : [];
        const idx = prods.findIndex((p: any) => p.name.toLowerCase().includes(pName.toLowerCase()));
        if (idx > -1) {
          prods[idx].price = pPrice;
          localStorage.setItem('products_list', JSON.stringify(prods));
          window.dispatchEvent(new CustomEvent('ai-sync-data'));
          return { type: 'success', icon: Pencil, color: '#10B981', title: `Updated price of "${prods[idx].name}" to Rs. ${pPrice}` };
        }
        return { type: 'error', icon: AlertCircle, color: '#EF4444', title: 'Product not found' };
      } catch {
        return { type: 'error', icon: AlertCircle, color: '#EF4444', title: 'Failed to update product' };
      }
    }

    case 'delete-product': {
      const pName = cmd.entities.name;
      try {
        const stored = localStorage.getItem('products_list');
        const prods = stored ? JSON.parse(stored) : [];
        const filtered = prods.filter((p: any) => !p.name.toLowerCase().includes(pName.toLowerCase()));
        if (filtered.length < prods.length) {
          localStorage.setItem('products_list', JSON.stringify(filtered));
          window.dispatchEvent(new CustomEvent('ai-sync-data'));
          return { type: 'success', icon: Trash2, color: '#EF4444', title: `Deleted product "${pName}"` };
        }
        return { type: 'error', icon: AlertCircle, color: '#EF4444', title: 'Product not found' };
      } catch {
        return { type: 'error', icon: AlertCircle, color: '#EF4444', title: 'Failed to delete product' };
      }
    }

    case 'remove-item':
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-invoice-action', { detail: { action: 'remove-item' } }));
      }, 300);
      return { type: 'success', icon: Trash2, color: '#EF4444', title: 'Removed item', subtitle: 'Removed last product from invoice.' };

    case 'select-customer':
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-invoice-action', { detail: { action: 'set-customer', value: cmd.entities.customerName } }));
      }, 300);
      return { type: 'success', icon: Users, color: '#2759CD', title: `Selected customer ${cmd.entities.customerName}` };

    case 'delete-customer':
      const nameToDelete = cmd.entities.name;
      const filtered = customers.filter(c => c.name.toLowerCase() !== nameToDelete.toLowerCase());
      if (filtered.length < customers.length) {
        writeCustomers(filtered);
        return { type: 'success', icon: Trash2, color: '#EF4444', title: `Deleted ${nameToDelete}` };
      }
      return { type: 'error', icon: AlertCircle, color: '#EF4444', title: 'Customer not found' };

    case 'mark-paid':
      return { type: 'success', icon: CheckCircle, color: '#10B981', title: 'Invoice marked as paid' };
    case 'send-invoice':
      return { type: 'success', icon: Send, color: '#0EA5E9', title: 'Invoice sent successfully' };
    case 'edit-invoice':
      return { type: 'success', icon: Pencil, color: '#F59E0B', title: 'Opening editor...' };
    case 'duplicate-invoice':
      return { type: 'success', icon: Copy, color: '#8B5CF6', title: 'Invoice duplicated' };

    // ── NAVIGATION ──
    case 'navigate': {
      const target = cmd.entities.target || '';
      const view = NAV_MAP[target] || NAV_MAP[target.replace(/s$/, '')] || null;
      if (view) {
        setTimeout(() => onViewChange(view), 300);
        const label = target.charAt(0).toUpperCase() + target.slice(1);
        return { type: 'success', icon: Compass, color: '#2759CD', title: `Navigating to ${label}`, subtitle: 'Taking you there now…' };
      }
      return { type: 'error', icon: AlertCircle, color: '#EF4444', title: 'Unknown destination', subtitle: `I couldn't find a page called "${target}".` };
    }

    // ── CREATE INVOICE ──
    case 'create-invoice': {
      // Fire inline panel event — NO navigation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-open-inline-panel', {
          detail: {
            customer: cmd.entities.customerName || '',
            focusField: cmd.entities.customerName ? 'items' : 'customer',
          },
        }));
      }, 200);
      return {
        type: 'success', icon: FileText, color: '#10B981',
        title: cmd.entities.customerName ? `Opening invoice for ${cmd.entities.customerName}` : 'Opening inline invoice creator',
        subtitle: 'A floating form will appear — no page change needed ✨',
      };
    }

    // ── CREATE CUSTOMER ──
    case 'create-customer': {
      const name = cmd.entities.name || 'New Customer';
      const newCustomer: StoredCustomer = {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: '+1 000 000 0000',
        location: 'Not specified',
        totalInvoiced: 'Rs. 0.00',
      };
      const updated = [newCustomer, ...customers];
      writeCustomers(updated);
      return {
        type: 'success', icon: Users, color: '#10B981',
        title: `Customer "${name}" created`,
        subtitle: `Added to customer database • ${updated.length} total customers`,
        actions: [{ label: 'View customers', action: () => onViewChange('customers') }],
      };
    }

      // ── ADD PRODUCT (editor) ──
      case 'add-product': {
        window.dispatchEvent(new CustomEvent('ai-inline-add-product', { detail: { name: cmd.entities.productName || '', price: Number(cmd.entities.price) || 0, qty: Number(cmd.entities.qty) || 1 } }));
        return { type: 'success', icon: PlusCircle, color: '#10B981', title: 'Product line added', subtitle: 'A new line item was added to the invoice.' };
      }

      // ── APPLY DISCOUNT ──
      case 'apply-discount': {
        const pct = parseInt(cmd.entities.percent || '0');
        window.dispatchEvent(new CustomEvent('ai-inline-discount', { detail: { percent: pct } }));
        return { type: 'success', icon: Tag, color: '#8B5CF6', title: `${pct}% discount applied`, subtitle: 'The discount has been updated on the current invoice.' };
      }

      // ── SET DUE DATE ──
      case 'set-due-date': {
        let dateVal = '';
        const ds = cmd.entities.dateStr || '';
        if (ds.includes('next week')) {
          const d = new Date(); d.setDate(d.getDate() + 7);
          dateVal = d.toISOString().split('T')[0];
        } else if (ds.includes('tomorrow')) {
          const d = new Date(); d.setDate(d.getDate() + 1);
          dateVal = d.toISOString().split('T')[0];
        } else {
          dateVal = ds;
        }
        window.dispatchEvent(new CustomEvent('ai-inline-due-date', { detail: { value: dateVal } }));
        return { type: 'success', icon: CalendarDays, color: '#0EA5E9', title: `Due date set to ${dateVal}`, subtitle: 'Invoice due date updated.' };
      }

    // ── FILL FROM LAST INVOICE ──
    case 'fill-last-invoice': {
      const lastInv = invoices[0];
      if (lastInv) {
        window.dispatchEvent(new CustomEvent('ai-invoice-action', { detail: { action: 'fill-last', invoiceId: lastInv.id } }));
        return { type: 'success', icon: Copy, color: '#2759CD', title: `Filling from ${lastInv.id}`, subtitle: `Copying data from invoice to ${lastInv.customer}.` };
      }
      return { type: 'error', icon: AlertCircle, color: '#EF4444', title: 'No previous invoice found', subtitle: 'There are no saved invoices to copy from.' };
    }

    // ── DELETE INVOICE ──
    case 'delete-invoice': {
      const id = cmd.entities.id;
      const exists = invoices.find(i => i.id.toUpperCase() === id);
      if (exists) {
        writeInvoices(invoices.filter(i => i.id.toUpperCase() !== id));
        try { localStorage.removeItem(`invoice_detail_${exists.id}`); } catch { /* */ }
        return { type: 'success', icon: Trash2, color: '#EF4444', title: `Invoice ${exists.id} deleted`, subtitle: `Removed invoice for ${exists.customer}.` };
      }
      return { type: 'error', icon: AlertCircle, color: '#EF4444', title: `Invoice "${id}" not found`, subtitle: 'Check the invoice ID and try again.' };
    }

    // ── CLEAR ITEMS ──
    case 'clear-items': {
      window.dispatchEvent(new CustomEvent('ai-invoice-action', { detail: { action: 'clear-items' } }));
      return { type: 'success', icon: Trash2, color: '#F59E0B', title: 'All items cleared', subtitle: 'All line items removed from the invoice.' };
    }

    // ── SAVE ──
    case 'save': {
      window.dispatchEvent(new CustomEvent('ai-invoice-action', { detail: { action: 'save' } }));
      return { type: 'success', icon: CheckCircle, color: '#10B981', title: 'Invoice saved', subtitle: 'Your invoice has been saved.' };
    }

    // ── EXPORT ──
    case 'export': {
      window.dispatchEvent(new CustomEvent('ai-invoice-action', { detail: { action: 'export' } }));
      return { type: 'success', icon: Download, color: '#2759CD', title: 'Export initiated', subtitle: 'Your report is being prepared for download.' };
    }

    // ── QUERY: Overdue ──
    case 'query-overdue': {
      const overdue = invoices.filter(i => i.status === 'Overdue');
      if (overdue.length === 0) return { type: 'info', icon: CheckCircle, color: '#10B981', title: 'No overdue invoices', subtitle: 'All invoices are current! 🎉' };
      const totalAmt = overdue.reduce((s, i) => s + i.rawAmount, 0);
      const overdueChartBars: ChartBar[] = overdue.slice(0, 6).map(i => ({
        label: i.customer.split(' ')[0],
        value: i.rawAmount,
        color: '#EF4444',
      }));
      return {
        type: 'data', icon: AlertCircle, color: '#EF4444',
        title: `${overdue.length} Overdue Invoice${overdue.length > 1 ? 's' : ''}`,
        subtitle: `Total overdue: Rs. ${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        chartBars: overdueChartBars,
        columns: ['ID', 'Customer', 'Amount', 'Due'],
        rows: overdue.slice(0, 6).map(i => ({ ID: i.id, Customer: i.customer, Amount: i.amount, Due: i.dueDate })),
        actions: [{ label: 'View All Invoices', action: () => onViewChange('invoices') }],
      };
    }

    // ── QUERY: Pending Invoices ──
    case 'query-pending-invoices': {
      const pending = invoices.filter(i => i.status === 'Pending');
      const totalAmt = pending.reduce((s, i) => s + i.rawAmount, 0);
      return {
        type: 'data', icon: Clock, color: '#F59E0B',
        title: `${pending.length} Pending Invoice${pending.length > 1 ? 's' : ''}`,
        subtitle: `Total pending: Rs. ${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        columns: ['ID', 'Customer', 'Amount', 'Due'],
        rows: pending.slice(0, 6).map(i => ({ ID: i.id, Customer: i.customer, Amount: i.amount, Due: i.dueDate })),
        actions: [{ label: 'View All Invoices', action: () => onViewChange('invoices') }],
      };
    }

    // ── QUERY: Pending Amount ──
    case 'query-pending-amount': {
      const pendingInvs = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue');
      const total = pendingInvs.reduce((s, i) => s + i.rawAmount, 0);
      const pendingBars: ChartBar[] = [
        { label: 'Pending', value: invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.rawAmount, 0), color: '#F59E0B' },
        { label: 'Overdue', value: invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.rawAmount, 0), color: '#EF4444' },
        { label: 'Paid', value: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.rawAmount, 0), color: '#10B981' },
      ];
      return {
        type: 'stat', icon: DollarSign, color: '#F59E0B',
        title: 'Total Pending Amount',
        stat: `Rs. ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        subtitle: `Across ${pendingInvs.length} unpaid invoices (${invoices.filter(i => i.status === 'Overdue').length} overdue)`,
        chartBars: pendingBars,
      };
    }

    // ── QUERY: Revenue ──
    case 'query-revenue': {
      const paid = invoices.filter(i => i.status === 'Paid');
      const total = paid.reduce((s, i) => s + i.rawAmount, 0);
      const now = new Date();
      const thisMonthPaid = paid.filter(i => { const d = new Date(i.issueDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
      const thisMonthTotal = thisMonthPaid.reduce((s, i) => s + i.rawAmount, 0);
      // Build last 6 months revenue chart
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const revBars: ChartBar[] = [];
      const colors = ['#6366F1','#8B5CF6','#A855F7','#EC4899','#F43F5E','#10B981'];
      for (let m = 5; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const monthPaid = paid.filter(i => { const id = new Date(i.issueDate); return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear(); });
        revBars.push({ label: monthNames[d.getMonth()], value: monthPaid.reduce((s, i) => s + i.rawAmount, 0), color: colors[5 - m] });
      }
      return {
        type: 'stat', icon: TrendingUp, color: '#10B981',
        title: 'Revenue Summary',
        stat: `Rs. ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        subtitle: `Total collected • This month: Rs. ${thisMonthTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} from ${thisMonthPaid.length} invoices`,
        chartBars: revBars,
        actions: [{ label: 'Go to Dashboard', action: () => onViewChange('dashboard1') }],
      };
    }

    // ── QUERY: Paid ──
    case 'query-paid': {
      const paid = invoices.filter(i => i.status === 'Paid');
      return {
        type: 'data', icon: CheckCircle, color: '#10B981',
        title: `${paid.length} Paid Invoice${paid.length > 1 ? 's' : ''}`,
        subtitle: `Total: Rs. ${paid.reduce((s, i) => s + i.rawAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        columns: ['ID', 'Customer', 'Amount'],
        rows: paid.slice(0, 6).map(i => ({ ID: i.id, Customer: i.customer, Amount: i.amount })),
      };
    }

    // ── QUERY: Drafts ──
    case 'query-drafts': {
      const drafts = invoices.filter(i => i.status === 'Draft');
      return {
        type: 'data', icon: FileText, color: '#64748B',
        title: `${drafts.length} Draft Invoice${drafts.length > 1 ? 's' : ''}`,
        columns: ['ID', 'Customer', 'Amount (Rs.)'],
        rows: drafts.slice(0, 6).map(i => ({ ID: i.id, Customer: i.customer, 'Amount (Rs.)': i.amount.replace(/^(Rs\.|PKR|\$)\s*/i, '') })),
      };
    }

    // ── QUERY: Total Invoices ──
    case 'query-total-invoices': {
      const byStatus = { Paid: 0, Pending: 0, Overdue: 0, Draft: 0 } as Record<string, number>;
      invoices.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; });
      const statusBars: ChartBar[] = [
        { label: 'Paid', value: byStatus.Paid, color: '#10B981' },
        { label: 'Pending', value: byStatus.Pending, color: '#F59E0B' },
        { label: 'Overdue', value: byStatus.Overdue, color: '#EF4444' },
        { label: 'Draft', value: byStatus.Draft, color: '#94A3B8' },
      ];
      return {
        type: 'stat', icon: BarChart3, color: '#2759CD',
        title: 'Invoice Overview',
        stat: `${invoices.length}`,
        subtitle: `Paid: ${byStatus.Paid} • Pending: ${byStatus.Pending} • Overdue: ${byStatus.Overdue} • Draft: ${byStatus.Draft}`,
        chartBars: statusBars,
      };
    }

    // ── QUERY: Top Customers ──
    case 'query-top-customers': {
      const customerMap: Record<string, number> = {};
      invoices.forEach(i => { customerMap[i.customer] = (customerMap[i.customer] || 0) + i.rawAmount; });
      const sorted = Object.entries(customerMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const customerColors = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981'];
      const customerBars: ChartBar[] = sorted.map(([name, amt], idx) => ({
        label: name.split(' ')[0],
        value: amt,
        color: customerColors[idx % customerColors.length],
      }));
      return {
        type: 'data', icon: Users, color: '#8B5CF6',
        title: 'Top customers by revenue',
        chartBars: customerBars,
        columns: ['Customer', 'Total revenue (Rs.)'],
        rows: sorted.map(([name, amt]) => ({ Customer: name, 'Total revenue (Rs.)': amt.toLocaleString(undefined, { minimumFractionDigits: 2 }) })),
      };
    }

    // ── QUERY: Active Customers ──
    case 'query-active-customers': {
      if (customers.length === 0) return { type: 'info', icon: Users, color: '#64748B', title: 'No customers found', subtitle: 'Your customer database is empty.' };
      return {
        type: 'data', icon: Users, color: '#10B981',
        title: `${customers.length} Active customer${customers.length > 1 ? 's' : ''}`,
        columns: ['Name', 'Email', 'Invoiced'],
        rows: customers.slice(0, 6).map(c => ({ Name: c.name, Email: c.email, Invoiced: c.totalInvoiced })),
        actions: [{ label: 'View all customers', action: () => onViewChange('customers') }],
      };
    }

    // ── FIND INVOICE ──
    case 'find-invoice': {
      const id = cmd.entities.id;
      const inv = invoices.find(i => i.id.toUpperCase().includes(id));
      if (inv) {
        return {
          type: 'data', icon: FileText, color: '#2759CD',
          title: `Invoice ${inv.id}`,
          subtitle: `${inv.customer} • ${inv.status} • ${inv.issueDate}`,
          columns: ['Field', 'Value'],
          rows: [
            { Field: 'Customer', Value: inv.customer },
            { Field: 'Amount', Value: inv.amount },
            { Field: 'Status', Value: inv.status },
            { Field: 'Issue date', Value: inv.issueDate },
            { Field: 'Due date', Value: inv.dueDate },
            { Field: 'Type', Value: inv.type },
          ],
          actions: [{ label: 'Edit Invoice', action: () => { window.dispatchEvent(new CustomEvent('ai-edit-invoice', { detail: { id: inv.id } })); } }],
        };
      }
      return { type: 'error', icon: AlertCircle, color: '#EF4444', title: `Invoice "${id}" not found`, subtitle: 'Try searching with a different ID.' };
    }

    // ── SEARCH CUSTOMER ──
    case 'search-customer': {
      const q = (cmd.entities.query || '').toLowerCase();
      const found = customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q));
      if (found.length === 0) return { type: 'info', icon: Search, color: '#64748B', title: 'No customers found', subtitle: `No results for "${cmd.entities.query}".` };
      return {
        type: 'data', icon: Users, color: '#2759CD',
        title: `${found.length} result${found.length > 1 ? 's' : ''} for "${cmd.entities.query}"`,
        columns: ['Name', 'Phone', 'Location'],
        rows: found.slice(0, 5).map(c => ({ Name: c.name, Phone: c.phone, Location: c.location })),
      };
    }

    // ── SORT HIGHEST ──
    case 'sort-highest': {
      const sorted = [...invoices].sort((a, b) => b.rawAmount - a.rawAmount);
      return {
        type: 'data', icon: TrendingUp, color: '#8B5CF6',
        title: 'Invoices by Highest Amount',
        columns: ['ID', 'Customer', 'Amount (Rs.)', 'Status'],
        rows: sorted.slice(0, 6).map(i => ({ ID: i.id, Customer: i.customer, 'Amount (Rs.)': i.amount.replace(/^(Rs\.|PKR|\$)\s*/i, ''), Status: i.status })),
        actions: [{ label: 'View All', action: () => onViewChange('invoices') }],
      };
    }

    // ── SORT LOWEST ──
    case 'sort-lowest': {
      const sorted = [...invoices].sort((a, b) => a.rawAmount - b.rawAmount);
      return {
        type: 'data', icon: TrendingUp, color: '#0EA5E9',
        title: 'Invoices by Lowest Amount',
        columns: ['ID', 'Customer', 'Amount (Rs.)', 'Status'],
        rows: sorted.slice(0, 6).map(i => ({ ID: i.id, Customer: i.customer, 'Amount (Rs.)': i.amount.replace(/^(Rs\.|PKR|\$)\s*/i, ''), Status: i.status })),
      };
    }

    // ── FILTER LAST 30 DAYS ──
    case 'filter-30-days': {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      const recent = invoices.filter(i => new Date(i.issueDate) >= cutoff);
      return {
        type: 'data', icon: CalendarDays, color: '#0EA5E9',
        title: `${recent.length} Invoices (Last 30 Days)`,
        subtitle: `Total: Rs. ${recent.reduce((s, i) => s + i.rawAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        columns: ['ID', 'Customer', 'Amount (Rs.)', 'Date'],
        rows: recent.slice(0, 6).map(i => ({ ID: i.id, Customer: i.customer, 'Amount (Rs.)': i.amount.replace(/^(Rs\.|PKR|\$)\s*/i, ''), Date: i.issueDate })),
      };
    }

    // ── UPDATE NTN ──
    case 'update-ntn': {
      setTimeout(() => onViewChange('customers'), 300);
      return { type: 'info', icon: Pencil, color: '#F59E0B', title: 'Update NTN', subtitle: 'Navigating to customers page. Select a customer to update their NTN.' };
    }

    // ── SHORTCUTS ──
    case 'shortcuts': {
      return {
        type: 'data', icon: Keyboard, color: '#64748B',
        title: 'Keyboard Shortcuts',
        columns: ['Shortcut', 'Action'],
        rows: [
          { Shortcut: 'Ctrl + K', Action: 'Open AI Command Bar' },
          { Shortcut: 'Escape', Action: 'Close command bar' },
          { Shortcut: '↑ ↓', Action: 'Navigate suggestions' },
          { Shortcut: 'Enter', Action: 'Execute command' },
        ],
      };
    }

    // ── HELP CREATE INVOICE ──
    case 'help-create-invoice': {
      return {
        type: 'info', icon: Info, color: '#2759CD',
        title: 'How to Create an Invoice',
        subtitle: '1. Click "Create Invoice" or type it here\n2. Select a customer\n3. Add product line items\n4. Set dates and terms\n5. Click Save',
        actions: [{ label: 'Create Invoice Now', action: () => onViewChange('add-invoice-v4') }],
      };
    }

    // ── TOP PRODUCTS ──
    case 'query-top-products': {
      return {
        type: 'info', icon: BarChart3, color: '#8B5CF6',
        title: 'Top Products',
        subtitle: 'Product analytics are based on invoice line items. Create more invoices to see trending products.',
      };
    }

    // ── UNKNOWN ──
    default:
      return {
        type: 'info', icon: Sparkles, color: brandPrimary,
        title: `Understanding: "${cmd.raw}"`,
        subtitle: "I'm not sure what you mean. Try commands like:\n• \"Show overdue invoices\"\n• \"Create invoice for Ali\"\n• \"Go to customers\"\n• \"What is pending amount?\"",
      };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTEXT-AWARE SUGGESTIONS — Changes per screen
   ═══════════════════════════════════════════════════════════════════════════ */

interface Suggestion {
  label: string;
  icon: LucideIcon;
  color: string;
  command: string; // the text to execute
}

function getSuggestions(activeView: string): Suggestion[] {
  const base: Record<string, Suggestion[]> = {
    'dashboard': [
      { label: 'Show total revenue', icon: TrendingUp, color: '#10B981', command: 'Show revenue this month' },
      { label: 'Show overdue invoices', icon: AlertCircle, color: '#EF4444', command: 'Show overdue invoices' },
      { label: 'Show pending payments', icon: DollarSign, color: '#F59E0B', command: 'What is pending amount?' },
      { label: 'Create invoice', icon: PlusCircle, color: '#10B981', command: 'Create invoice' },
      { label: 'View customers', icon: Users, color: '#8B5CF6', command: 'Go to customers' },
    ],
    'dashboard1': [
      { label: 'Show total revenue', icon: TrendingUp, color: '#10B981', command: 'Show revenue this month' },
      { label: 'Show overdue invoices', icon: AlertCircle, color: '#EF4444', command: 'Show overdue invoices' },
      { label: 'Show pending payments', icon: DollarSign, color: '#F59E0B', command: 'What is pending amount?' },
      { label: 'Create invoice', icon: PlusCircle, color: '#10B981', command: 'Create invoice' },
      { label: 'View customers', icon: Users, color: '#8B5CF6', command: 'Go to customers' },
    ],
    'dashboard2': [
      { label: 'Show total revenue', icon: TrendingUp, color: '#10B981', command: 'Show revenue this month' },
      { label: 'Show overdue invoices', icon: AlertCircle, color: '#EF4444', command: 'Show overdue invoices' },
      { label: 'Show pending payments', icon: DollarSign, color: '#F59E0B', command: 'What is pending amount?' },
      { label: 'Create invoice', icon: PlusCircle, color: '#10B981', command: 'Create invoice' },
      { label: 'View customers', icon: Users, color: '#8B5CF6', command: 'Go to customers' },
    ],
    'invoices': [
      { label: 'Show unpaid invoices', icon: Clock, color: '#F59E0B', command: 'Show pending invoices' },
      { label: 'Filter last 30 days', icon: CalendarDays, color: '#0EA5E9', command: 'Filter last 30 days' },
      { label: 'Search invoice #', icon: Search, color: '#2759CD', command: 'Search invoice ' },
      { label: 'Sort by amount', icon: TrendingUp, color: '#8B5CF6', command: 'Sort by highest amount' },
      { label: 'Show highest invoice', icon: ArrowUpRight, color: '#8B5CF6', command: 'Sort by highest amount' },
    ],
    'add-invoice': [
      { label: 'Add product', icon: PlusCircle, color: '#10B981', command: 'Add product' },
      { label: 'Remove item', icon: Trash2, color: '#EF4444', command: 'Remove item' },
      { label: 'Apply discount', icon: Tag, color: '#8B5CF6', command: 'Apply 10% discount' },
      { label: 'Set due date', icon: CalendarDays, color: '#0EA5E9', command: 'Set due date next week' },
      { label: 'Select customer', icon: Users, color: '#2759CD', command: 'Select customer ' },
      { label: 'Fill from last invoice', icon: Copy, color: '#8B5CF6', command: 'Fill from last invoice' },
    ],
    'customers': [
      { label: 'Add new customer', icon: PlusCircle, color: '#10B981', command: 'Add customer ' },
      { label: 'Search customer', icon: Search, color: '#2759CD', command: 'Search customer ' },
      { label: 'Update NTN', icon: Pencil, color: '#F59E0B', command: 'Update NTN' },
      { label: 'Show active customers', icon: Users, color: '#8B5CF6', command: 'Show active customers' },
      { label: 'Delete customer', icon: Trash2, color: '#EF4444', command: 'Delete customer ' },
    ],
    'products': [
      { label: 'Add product', icon: PlusCircle, color: '#10B981', command: 'Add product' },
      { label: 'Delete product', icon: Trash2, color: '#EF4444', command: 'Delete product ' },
      { label: 'Update price', icon: Pencil, color: '#F59E0B', command: 'Update price of ' },
      { label: 'Show all products', icon: Box, color: '#8B5CF6', command: 'Go to products' },
    ],
    'settings': [
      { label: 'Change theme', icon: Palette, color: '#8B5CF6', command: 'Change theme' },
      { label: 'Go to dashboard', icon: LayoutDashboard, color: '#2759CD', command: 'Go to dashboard' },
      { label: 'Keyboard shortcuts', icon: Keyboard, color: '#64748B', command: 'Show shortcuts' },
      { label: 'Create invoice', icon: PlusCircle, color: '#10B981', command: 'Create invoice' },
    ],
    'help': [
      { label: 'How to create invoice?', icon: Info, color: '#2759CD', command: 'How to create invoice' },
      { label: 'Keyboard shortcuts', icon: Keyboard, color: '#64748B', command: 'Show shortcuts' },
      { label: 'Go to dashboard', icon: LayoutDashboard, color: '#2759CD', command: 'Go to dashboard' },
      { label: 'Create invoice', icon: PlusCircle, color: '#10B981', command: 'Create invoice' },
    ],
    'invoice-detail': [
      { label: 'Mark as paid', icon: CheckCircle, color: '#10B981', command: 'Mark as paid' },
      { label: 'Download invoice', icon: Download, color: '#2759CD', command: 'Download invoice' },
      { label: 'Send invoice', icon: Send, color: '#0EA5E9', command: 'Send invoice' },
      { label: 'Edit invoice', icon: Pencil, color: '#F59E0B', command: 'Edit invoice' },
      { label: 'Duplicate invoice', icon: Copy, color: '#8B5CF6', command: 'Duplicate invoice' },
    ]
  };

  // Map add-invoice variants to same suggestions
  const view = activeView.startsWith('add-invoice') ? 'add-invoice' : activeView;
  return base[view] || base['products'] || base['dashboard'];
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK COMMANDS — for autocomplete matching
   ═══════════════════════════════════════════════════════════════════════════ */

interface QuickCommand {
  label: string;
  icon: LucideIcon;
  category: string;
  categoryColor: string;
  keywords: string[];
  command: string;
}

const quickCommands: QuickCommand[] = [
  // Navigation
  { label: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigate', categoryColor: '#2759CD', keywords: ['dashboard', 'home', 'main'], command: 'Go to dashboard' },
  { label: 'Go to Invoices', icon: FileText, category: 'Navigate', categoryColor: '#2759CD', keywords: ['invoices', 'bills', 'list'], command: 'Go to invoices' },
  { label: 'Go to Customers', icon: Users, category: 'Navigate', categoryColor: '#2759CD', keywords: ['customers'], command: 'Go to customers' },
  { label: 'Go to Settings', icon: Settings, category: 'Navigate', categoryColor: '#2759CD', keywords: ['settings', 'config'], command: 'Go to settings' },
  { label: 'Go to Help', icon: HelpCircle, category: 'Navigate', categoryColor: '#2759CD', keywords: ['help', 'support'], command: 'Go to help' },
  // Actions
  { label: 'Create Invoice', icon: PlusCircle, category: 'Action', categoryColor: '#10B981', keywords: ['create', 'new', 'invoice', 'make'], command: 'Create invoice' },
  { label: 'Add Product', icon: PlusCircle, category: 'Action', categoryColor: '#10B981', keywords: ['add', 'product', 'item', 'line'], command: 'Add product' },
  { label: 'Add Customer', icon: PlusCircle, category: 'Action', categoryColor: '#10B981', keywords: ['add', 'customer', 'new'], command: 'Add customer ' },
  { label: 'Apply Discount', icon: Tag, category: 'Action', categoryColor: '#10B981', keywords: ['apply', 'discount', 'percent', 'off'], command: 'Apply 10% discount' },
  { label: 'Fill from Last Invoice', icon: Copy, category: 'Action', categoryColor: '#10B981', keywords: ['fill', 'last', 'copy', 'template'], command: 'Fill from last invoice' },
  { label: 'Save Invoice', icon: CheckCircle, category: 'Action', categoryColor: '#10B981', keywords: ['save', 'submit'], command: 'Save' },
  { label: 'Export Report', icon: Download, category: 'Action', categoryColor: '#10B981', keywords: ['export', 'download', 'pdf'], command: 'Export report' },
  // Queries
  { label: 'Show Overdue Invoices', icon: AlertCircle, category: 'Query', categoryColor: '#F59E0B', keywords: ['overdue', 'late', 'unpaid'], command: 'Show overdue invoices' },
  { label: 'Show Pending Invoices', icon: Clock, category: 'Query', categoryColor: '#F59E0B', keywords: ['pending', 'unpaid', 'waiting'], command: 'Show pending invoices' },
  { label: 'Pending Amount', icon: DollarSign, category: 'Query', categoryColor: '#F59E0B', keywords: ['pending', 'amount', 'total', 'owed'], command: 'What is pending amount?' },
  { label: 'Revenue Summary', icon: TrendingUp, category: 'Query', categoryColor: '#F59E0B', keywords: ['revenue', 'income', 'total', 'earned'], command: 'Show revenue this month' },
  { label: 'Top Customers', icon: Users, category: 'Query', categoryColor: '#F59E0B', keywords: ['top', 'best', 'customers', 'revenue'], command: 'Show top customers' },
  { label: 'Show Paid Invoices', icon: CheckCircle, category: 'Query', categoryColor: '#F59E0B', keywords: ['paid', 'completed', 'cleared'], command: 'Show paid invoices' },
  { label: 'Show Drafts', icon: FileText, category: 'Query', categoryColor: '#F59E0B', keywords: ['draft', 'drafts', 'incomplete'], command: 'Show draft invoices' },
  { label: 'Sort by Amount', icon: TrendingUp, category: 'Query', categoryColor: '#F59E0B', keywords: ['sort', 'highest', 'amount', 'biggest'], command: 'Sort by highest amount' },
  { label: 'Last 30 Days', icon: CalendarDays, category: 'Query', categoryColor: '#F59E0B', keywords: ['last', '30', 'days', 'recent', 'month'], command: 'Filter last 30 days' },
  // Updates
  { label: 'Update NTN', icon: Pencil, category: 'Update', categoryColor: '#8B5CF6', keywords: ['update', 'ntn', 'tax'], command: 'Update NTN' },
  { label: 'Set Due Date', icon: CalendarDays, category: 'Update', categoryColor: '#8B5CF6', keywords: ['due', 'date', 'set', 'change'], command: 'Set due date next week' },
  { label: 'Change Theme', icon: Palette, category: 'Update', categoryColor: '#8B5CF6', keywords: ['theme', 'color', 'change'], command: 'Change theme' },
  { label: 'Clear All Items', icon: Trash2, category: 'Update', categoryColor: '#8B5CF6', keywords: ['clear', 'remove', 'all', 'items'], command: 'Clear all items' },
  // Help
  { label: 'Go to Products', icon: Box, category: 'Navigate', categoryColor: '#2759CD', keywords: ['products', 'inventory', 'items'], command: 'Go to products' },
  { label: 'Add Product to Inventory', icon: PlusCircle, category: 'Action', categoryColor: '#10B981', keywords: ['add', 'new', 'product', 'inventory'], command: 'Add product' },
  { label: 'Delete Product', icon: Trash2, category: 'Action', categoryColor: '#EF4444', keywords: ['delete', 'remove', 'product'], command: 'Delete product ' },
  { label: 'Update Product Price', icon: Pencil, category: 'Update', categoryColor: '#8B5CF6', keywords: ['update', 'price', 'product', 'change'], command: 'Update price of ' },
  { label: 'How to Create Invoice', icon: Info, category: 'Help', categoryColor: '#64748B', keywords: ['how', 'create', 'guide', 'tutorial'], command: 'How to create invoice' },
  { label: 'Keyboard Shortcuts', icon: Keyboard, category: 'Help', categoryColor: '#64748B', keywords: ['keyboard', 'shortcuts', 'hotkey'], command: 'Show shortcuts' },
];

function filterCommands(query: string): QuickCommand[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  return quickCommands
    .filter(cmd => {
      const labelMatch = cmd.label.toLowerCase().includes(q);
      const keywordMatch = words.every(w => cmd.keywords.some(kw => kw.includes(w)) || cmd.label.toLowerCase().includes(w));
      return labelMatch || keywordMatch;
    })
    .slice(0, 7);
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const AICommandBar: React.FC<Props> = ({ activeView, onViewChange }) => {
  const { brand } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);


  const [result, setResult] = useState<AIResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => getSuggestions(activeView), [activeView]);
  const filteredCmds = useMemo(() => filterCommands(query), [query]);
  const hasQuery = query.trim().length > 0;
  const showAutocomplete = hasQuery && filteredCmds.length > 0 && !result;

  // ── Execute a command string ──
  const runCommand = useCallback((text: string) => {
    setIsProcessing(true);
    setResult(null);
    const parsed = parseCommand(text);
    setTimeout(() => {
      const res = executeCommand(parsed, onViewChange, brand.primary);
      setResult(res);
      setIsProcessing(false);
      // Auto-close for navigation
      if (parsed.intent === 'navigate' || parsed.intent === 'create-invoice') {
        setTimeout(() => { setIsOpen(false); setQuery(''); setResult(null); }, 800);
      }
    }, 450);
  }, [onViewChange, brand.primary]);

  const [isListening, setIsListening] = useState(false);

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      // Automatically run command after speech
      setTimeout(() => runCommand(transcript), 300);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [runCommand]);

  // ── Handle submit ──
  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    if (selectedIndex >= 0 && filteredCmds[selectedIndex]) {
      runCommand(filteredCmds[selectedIndex].command);
    } else {
      runCommand(query);
    }
    setSelectedIndex(-1);
  }, [query, selectedIndex, filteredCmds, runCommand]);

  // ── Keyboard ──
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (result) { setResult(null); }
      else { setIsOpen(false); setQuery(''); setSelectedIndex(-1); inputRef.current?.blur(); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(p => Math.min(p + 1, filteredCmds.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(p => Math.max(p - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [filteredCmds.length, handleSubmit, result]);

  // ── Scroll selected into view ──
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-cmd-item]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // ── Global Ctrl+K ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setResult(null);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Click outside ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false); setQuery(''); setResult(null); setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // ── Reset on query change ──
  useEffect(() => { setSelectedIndex(-1); if (result) setResult(null); }, [query]);

  // ── Clear result when view changes ──
  useEffect(() => { setResult(null); }, [activeView]);

  const close = () => { setIsOpen(false); setQuery(''); setResult(null); setSelectedIndex(-1); };

  /* ─── RENDER ─── */
  return (
    <div ref={containerRef} className="relative flex-grow print-hidden w-full" style={{ zIndex: 100 }}>

      {/* ═══ INPUT BAR ═══ */}
      <div className="relative group flex items-center bg-white border border-slate-200 rounded-[14px] p-1.5 transition-all duration-300"
           style={{
             borderColor: isOpen ? `${brand.primary}40` : '#e2e8f0',
             boxShadow: isOpen ? `0 4px 24px -4px ${brand.primary}12, 0 0 0 1px ${brand.primary}0a` : '0 1px 3px rgba(0,0,0,0.04)',
           }}
           onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}>
        
        {/* Left Icon Block */}
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ml-1 transition-transform group-hover:scale-105" style={{ background: brand.primary }}>
           <Sparkles className="w-4 h-4 text-white" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI anything or perform an action…"
          className="flex-grow bg-transparent text-[13px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none px-3"
        />

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 pr-1 shrink-0">
          <div className="hidden sm:flex items-center px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-400 tracking-wider">
            Ctrl+K
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); startVoiceInput(); }}
            className={`p-1.5 rounded-full transition-colors ${isListening ? 'animate-pulse' : ''}`}
            style={{ 
              color: isListening ? '#EF4444' : brand.primary, 
              backgroundColor: isListening ? '#EF444415' : `${brand.primary}10` 
            }}
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            style={{ 
              backgroundColor: query.trim() ? brand.primary : '#f1f5f9', 
              color: query.trim() ? 'white' : '#94a3b8',
            }}
          >
            <Send className="w-3.5 h-3.5" style={{ transform: 'translateX(-1px) translateY(1px)' }} />
          </button>
        </div>
      </div>

      {/* ═══ EXTERNAL SUGGESTION CHIPS ═══ */}
      {!hasQuery && !result && (
        <div className="relative flex flex-wrap items-center gap-2 mt-3 pl-1 z-40">
          {suggestions.map((sug, i) => {
            const SugIcon = sug.icon;
            return (
              <button
                key={`${activeView}-${i}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                  if (sug.command.endsWith(' ')) {
                    setQuery(sug.command);
                    inputRef.current?.focus();
                  } else {
                    setQuery(sug.command);
                    runCommand(sug.command);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <SugIcon className="w-3 h-3" style={{ color: brand.primary }} />
                {sug.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ DROPDOWN PANEL ═══ */}
      <AnimatePresence>
        {isOpen && (hasQuery || result || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 overflow-hidden"
            style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.15), 0 4px 25px -8px rgba(0,0,0,0.1)' }}
          >
            {/* Processing shimmer */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[3px] relative overflow-hidden">
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(90deg, transparent, ${brand.primary}, transparent)` }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">

              {/* ── PROCESSING STATE ── */}
              {isProcessing && (
                <div className="p-8 flex flex-col items-center gap-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="w-6 h-6" style={{ color: brand.primary }} />
                  </motion.div>
                  <p className="text-sm font-semibold text-slate-500">Processing…</p>
                </div>
              )}

              {/* ── AI RESULT ── */}
              {result && !isProcessing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-4">
                  {/* Result header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${result.color}14`, color: result.color }}>
                      <result.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-[14px] font-bold text-slate-800">{result.title}</h4>
                      {result.subtitle && (
                        <p className="text-[12px] text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed">{result.subtitle}</p>
                      )}
                    </div>
                    <button onClick={() => { setResult(null); setQuery(''); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stat display */}
                  {result.type === 'stat' && result.stat && (
                    <div className="ml-12 mb-3 px-4 py-3 rounded-xl" style={{ background: `${result.color}08`, border: `1px solid ${result.color}18` }}>
                      <p className="text-3xl font-black tracking-tight" style={{ color: result.color }}>{result.stat}</p>
                    </div>
                  )}

                  {/* ── CHART BARS ── */}
                  {result.chartBars && result.chartBars.length > 0 && (() => {
                    const maxVal = Math.max(...result.chartBars!.map(b => b.value), 1);
                    return (
                      <div className="ml-12 mb-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-end gap-3 justify-between" style={{ height: 120 }}>
                          {result.chartBars!.map((bar, idx) => {
                            const pct = Math.max((bar.value / maxVal) * 100, 4);
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                                <motion.span
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.08 + 0.3 }}
                                  className="text-[10px] font-bold text-slate-500 truncate max-w-full"
                                >
                                  {bar.value > 0 ? (bar.value >= 1000 ? `Rs. ${(bar.value / 1000).toFixed(1)}k` : `Rs. ${bar.value}`) : '—'}
                                </motion.span>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${pct}%` }}
                                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.23, 1, 0.32, 1] }}
                                  className="w-full max-w-[40px] rounded-t-lg relative overflow-hidden"
                                  style={{ backgroundColor: bar.color }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20" />
                                </motion.div>
                                <span className="text-[9px] font-semibold text-slate-400 truncate max-w-full">{bar.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Data table */}
                  {result.type === 'data' && result.columns && result.rows && result.rows.length > 0 && (
                    <div className="ml-12 mb-3 rounded-xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            {result.columns.map(col => (
                              <th key={col} className="px-3 py-2 text-[10px] font-black tracking-widest" style={{ color: brand.dark }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                              {result.columns!.map(col => (
                                <td key={col} className="px-3 py-2 text-[12px] font-medium text-slate-700 truncate max-w-[160px]">{row[col]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Action buttons */}
                  {result.actions && result.actions.length > 0 && (
                    <div className="ml-12 flex items-center gap-2">
                      {result.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => { act.action(); close(); }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white transition-all duration-200 cursor-pointer hover:opacity-90"
                          style={{ background: brand.primary }}
                        >
                          {act.label}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                      <button onClick={() => { setResult(null); setQuery(''); }} className="px-3.5 py-2 rounded-xl text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer">
                        Close
                      </button>
                    </div>
                  )}
                </motion.div>
              )}



              {/* ── AUTOCOMPLETE RESULTS ── */}
              {showAutocomplete && !isProcessing && (
                <div className="p-3" ref={listRef}>
                  <p className="text-[10px] font-bold mb-2 px-2" style={{ color: brand.dark }}>Commands</p>
                  <div className="space-y-0.5">
                    {filteredCmds.map((cmd, i) => {
                      const CmdIcon = cmd.icon;
                      const isSelected = i === selectedIndex;
                      return (
                        <motion.button
                          key={cmd.label}
                          data-cmd-item
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.12, delay: i * 0.025 }}
                          onClick={() => runCommand(cmd.command)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer"
                          style={{
                            background: isSelected ? `${brand.primary}08` : 'transparent',
                            border: isSelected ? `1px solid ${brand.primary}18` : '1px solid transparent',
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cmd.categoryColor}10`, color: cmd.categoryColor }}>
                            <CmdIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 truncate">{highlightMatch(cmd.label, query)}</p>
                            <p className="text-[10px] font-medium mt-0.5" style={{ color: cmd.categoryColor }}>{cmd.category}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 transition-all duration-200"
                            style={{ color: isSelected ? brand.primary : '#e2e8f0', transform: isSelected ? 'translateX(2px)' : 'none' }}
                          />
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Free-text fallback */}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button onClick={handleSubmit}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${brand.primary}10`, color: brand.primary }}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-slate-700">
                          Ask AI: "<span style={{ color: brand.primary }}>{query}</span>"
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Press Enter to execute</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── No matches — pure free text ── */}
              {hasQuery && filteredCmds.length === 0 && !result && !isProcessing && (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${brand.primary}0c`, color: brand.primary }}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Ask the AI</p>
                  <p className="text-xs text-slate-400 mb-3">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">Enter</kbd> to execute</p>
                  <button onClick={handleSubmit}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-white transition-all duration-200 cursor-pointer hover:opacity-90"
                    style={{ background: brand.primary }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Execute: "{query}"
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SUBTLE BACKDROP ═══ */}
      <AnimatePresence>

      </AnimatePresence>
    </div>
  );
};

/* ── Helper: Highlight matching text ── */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-black" style={{ textDecoration: 'underline', textDecorationColor: 'currentColor', textUnderlineOffset: '2px' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default AICommandBar;
