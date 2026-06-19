export interface CustomerListItem {
  name: string;
  email: string;
  phone: string;
  location: string;
  totalInvoiced: string;
}
export const SALES_PERSONS = [
  { id: 's-arsalan', name: 'Arsalan Ahmed' },
  { id: 'sp-1', name: 'Ahmed Raza' },
  { id: 'sp-2', name: 'Sara Khan' },
  { id: 'sp-3', name: 'Usman Ali' },
  { id: 'sp-4', name: 'Fatima Malik' },
  { id: 'sp-5', name: 'Hassan Tariq' },
];

export const sampleCustomers = [
  { id: '1', name: 'Arsalan Abdul Sattar', subtitle: 'Premium Customer · Karachi, PK', fullAddress: 'House 42, Street 5, Karachi, PK', strn: 'STRN-042-2024', ntn: '1234567-8', province: 'Sindh', registrationType: 'Registered', creditLimit: 500000, balance: 125000, status: 'active' },
  { id: '2', name: 'Google DeepMind', subtitle: 'Enterprise · London, UK', fullAddress: '6 Pancras Square, London, UK', strn: 'STRN-UK-9821', ntn: '9876543-1', province: 'London', registrationType: 'Registered', creditLimit: 2000000, balance: 0, status: 'active' },
  { id: '3', name: 'Al-Madina Traders', subtitle: 'Wholesale · Lahore, PK', fullAddress: 'Shop 12, Main Bazar, Lahore, PK', strn: 'STRN-LHR-3310', ntn: '4561237-5', province: 'Punjab', registrationType: 'Unregistered', creditLimit: 150000, balance: 89000, status: 'overdue' },
  { id: '4', name: 'TechFlow Solutions', subtitle: 'SaaS · Dubai, UAE', fullAddress: 'Office 404, Tech Tower, Dubai, UAE', strn: 'STRN-UAE-7821', ntn: '7894561-2', province: 'Dubai', registrationType: 'Registered', creditLimit: 750000, balance: 210000, status: 'active' },
];

export const DEFAULT_CUSTOMERS: CustomerListItem[] = [
  { name: 'BlueRitt Technologies', email: 'billing@blueritt.com', phone: '+1 234 567 890', location: 'Austin, TX', totalInvoiced: 'Rs. 45,200' },
  { name: 'Acme Corp', email: 'finance@acme.com', phone: '+1 987 654 321', location: 'New York, NY', totalInvoiced: 'Rs. 12,800' },
  { name: 'Global Solutions', email: 'hello@globalsol.com', phone: '+1 555 123 456', location: 'San Francisco, CA', totalInvoiced: 'Rs. 8,900' },
  { name: 'Starlight Media', email: 'accounts@starlight.io', phone: '+1 444 777 888', location: 'London, UK', totalInvoiced: 'Rs. 2,450' },
  { name: 'Ahmed', email: 'ahmed@example.com', phone: '+92 300 1234567', location: 'Lahore, Pakistan', totalInvoiced: 'Rs. 0.00' },
  { name: 'Customer Six', email: 'customer6@example.com', phone: '+1 111 111 111', location: 'Chicago, IL', totalInvoiced: 'Rs. 5,000' },
  { name: 'Customer Seven', email: 'customer7@example.com', phone: '+1 222 222 222', location: 'Miami, FL', totalInvoiced: 'Rs. 3,200' },
  { name: 'Customer Eight', email: 'customer8@example.com', phone: '+1 333 333 333', location: 'Seattle, WA', totalInvoiced: 'Rs. 7,800' },
  { name: 'Customer Nine', email: 'customer9@example.com', phone: '+1 444 444 444', location: 'Denver, CO', totalInvoiced: 'Rs. 2,300' },
  { name: 'Customer Ten', email: 'customer10@example.com', phone: '+1 555 555 555', location: 'Boston, MA', totalInvoiced: 'Rs. 6,500' },
  { name: 'Customer Eleven', email: 'customer11@example.com', phone: '+1 666 666 666', location: 'Houston, TX', totalInvoiced: 'Rs. 4,400' },
  { name: 'Customer Twelve', email: 'customer12@example.com', phone: '+1 777 777 777', location: 'Phoenix, AZ', totalInvoiced: 'Rs. 3,600' },
  { name: 'Customer Thirteen', email: 'customer13@example.com', phone: '+1 888 888 888', location: 'Philadelphia, PA', totalInvoiced: 'Rs. 5,900' },
  { name: 'Customer Fourteen', email: 'customer14@example.com', phone: '+1 999 999 999', location: 'San Antonio, TX', totalInvoiced: 'Rs. 2,800' },
  { name: 'Customer Fifteen', email: 'customer15@example.com', phone: '+1 101 010 1010', location: 'Dallas, TX', totalInvoiced: 'Rs. 4,700' },
  { name: 'Customer Sixteen', email: 'customer16@example.com', phone: '+1 202 020 2020', location: 'San Jose, CA', totalInvoiced: 'Rs. 3,100' },
  { name: 'Customer Seventeen', email: 'customer17@example.com', phone: '+1 303 030 3030', location: 'Austin, TX', totalInvoiced: 'Rs. 6,200' },
  { name: 'Customer Eighteen', email: 'customer18@example.com', phone: '+1 404 040 4040', location: 'Jacksonville, FL', totalInvoiced: 'Rs. 2,900' },
  { name: 'Customer Nineteen', email: 'customer19@example.com', phone: '+1 505 050 5050', location: 'Fort Worth, TX', totalInvoiced: 'Rs. 5,300' },
  { name: 'Customer Twenty', email: 'customer20@example.com', phone: '+1 606 060 6060', location: 'Columbus, OH', totalInvoiced: 'Rs. 4,100' },
  { name: 'Customer Twenty-One', email: 'customer21@example.com', phone: '+1 707 070 7070', location: 'Charlotte, NC', totalInvoiced: 'Rs. 3,700' },
  { name: 'Customer Twenty-Two', email: 'customer22@example.com', phone: '+1 808 080 8080', location: 'San Francisco, CA', totalInvoiced: 'Rs. 6,800' },
  { name: 'Customer Twenty-Three', email: 'customer23@example.com', phone: '+1 909 090 9090', location: 'Indianapolis, IN', totalInvoiced: 'Rs. 2,500' },
  { name: 'Customer Twenty-Four', email: 'customer24@example.com', phone: '+1 111 222 3333', location: 'Seattle, WA', totalInvoiced: 'Rs. 7,200' },
  { name: 'Customer Twenty-Five', email: 'customer25@example.com', phone: '+1 222 333 4444', location: 'Denver, CO', totalInvoiced: 'Rs. 3,900' },
  { name: 'Customer Twenty-Six', email: 'customer26@example.com', phone: '+1 333 444 5555', location: 'Boston, MA', totalInvoiced: 'Rs. 5,500' },
  { name: 'Customer Twenty-Seven', email: 'customer27@example.com', phone: '+1 444 555 6666', location: 'Chicago, IL', totalInvoiced: 'Rs. 4,300' },
  { name: 'Customer Twenty-Eight', email: 'customer28@example.com', phone: '+1 555 666 7777', location: 'Miami, FL', totalInvoiced: 'Rs. 2,600' },
  { name: 'Customer Twenty-Nine', email: 'customer29@example.com', phone: '+1 666 777 8888', location: 'Houston, TX', totalInvoiced: 'Rs. 6,100' },
  { name: 'Customer Thirty', email: 'customer30@example.com', phone: '+1 777 888 9999', location: 'Phoenix, AZ', totalInvoiced: 'Rs. 4,800' },
];
