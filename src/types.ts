export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderAddress: string;
  clientName: string;
  clientAddress: string;
  subject: string;
  reference: string;
  items: InvoiceItem[];
  taxRate: number;
  discountPercentage: number;
  discountAmount: number;
  shippingCharges: number;
  bankAccount: string;
  notes: string;
}
