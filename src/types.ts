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
  clientName: string;
  clientAddress: string;
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
}
