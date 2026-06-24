export interface Company {
  id: string;
  name: string;
  code: string;
  industry: string;
  ntn?: string;
  strn?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  active: boolean;
}

export const seedCompanies: Company[] = [
  { id: 'c1', name: 'Tech Solutions Inc.', code: 'TECH', industry: 'IT', active: true },
  { id: 'c2', name: 'Global Manufacturing Corp', code: 'GMC', industry: 'Manufacturing', active: true },
  { id: 'c3', name: 'Retail Express', code: 'RET', industry: 'Retail', active: false },
  { id: 'c4', name: 'Services & Co.', code: 'SERV', industry: 'Services', active: true },
];
