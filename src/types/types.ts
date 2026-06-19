export type InvoiceStatus = 'Posted' | 'Unposted';

export interface Invoice {
  id: string;
  customer: string;
  customerInitials: string;
  customerColor: string;
  issueDate: string;
  dueDate: string;
  amount: string;
  rawAmount: number;
  status: InvoiceStatus;
  payment: string;
  type: string;
  companyId?: string;
  branchId?: string;
  fbrInvoiceNumber?: string;
}

export interface InvoiceItem {
  id: string;
  productCode: string;
  description: string;
  unit: string;
  unitDetails: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  furtherTax: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderAddress: string;
  customerName: string;
  customerAddress: string;
  subject: string;
  reference: string;
  productCode: string;
  remarks: string;
  type: string;
  items: InvoiceItem[];
  taxRate: number;
  discountPercentage: number;
  discountAmount: number;
  shippingCharges: number;
  roundOff: number;
  receivedAmount: number;
  bankAccount: string;
  notes: string;
  salesPerson: string;
  department: string;
  fbrInvoiceNumber?: string;
  status?: InvoiceStatus;
}
