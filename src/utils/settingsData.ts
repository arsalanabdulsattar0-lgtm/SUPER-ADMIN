import type { TaxSetup } from '../pages/Settings/Settings';
import type { SalesPerson } from '../pages/Settings/components/SalesPersonModule';
import type { Company } from '../pages/Settings/components/CompanyModule';

export const seedTaxes: TaxSetup[] = [
  { id: 't1', taxCode: 'GST-17', taxType: 'GST', taxRate: 17, province: 'Punjab',  active: true  },
  { id: 't2', taxCode: 'SST-16', taxType: 'SST', taxRate: 16, province: 'Sindh',   active: true  },
  { id: 't3', taxCode: 'WHT-10', taxType: 'WHT', taxRate: 10, province: 'KPK',     active: false },
  { id: 't4', taxCode: 'FED-5',  taxType: 'FED', taxRate: 5,  province: 'Federal', active: true  },
];

export const seedSalespeople: SalesPerson[] = [
  {
    id: 's1',
    name: 'Ahmed Raza',
    SPUserName: 'ahmed.raza',
    contact: '0300-1234567',
    address1: 'Main Boulevard, Gulberg',
    address2: 'Phase 5, DHA',
    city: 'Lahore',
    telephone1: '042-35711111',
    telephone2: '042-35722222',
    fax: '042-35733333',
    email: 'ahmed.raza@example.com',
    commission: 3,
    commissionPercent: 3,
    commissionAmount: 15000,
    MTarget: 500000,
    MtargetQty: 200,
    targetAmount: 500000,
    targetQuantity: 200,
    JanT: 480000,
    FebT: 510000,
    MarchT: 530000,
    AprilT: 490000,
    MayT: 520000,
    JuneT: 475000,
    JulyT: 540000,
    AugT: 500000,
    SeptT: 515000,
    OctT: 560000,
    NovT: 580000,
    DecT: 620000,
    active: true,
    createdDate: '2026-01-15',
  },
  {
    id: 's2',
    name: 'Sara Malik',
    SPUserName: 'sara.malik',
    contact: '0321-7654321',
    address1: 'I.I. Chundrigar Road',
    address2: 'Clifton',
    city: 'Karachi',
    telephone1: '021-34567890',
    telephone2: '021-34567891',
    fax: '021-34567892',
    email: 'sara.malik@example.com',
    commission: 2.5,
    commissionPercent: 2.5,
    commissionAmount: 8750,
    MTarget: 350000,
    MtargetQty: 150,
    targetAmount: 350000,
    targetQuantity: 150,
    JanT: 320000,
    FebT: 340000,
    MarchT: 360000,
    AprilT: 330000,
    MayT: 350000,
    JuneT: 310000,
    JulyT: 370000,
    AugT: 345000,
    SeptT: 360000,
    OctT: 390000,
    NovT: 410000,
    DecT: 430000,
    active: true,
    createdDate: '2026-02-01',
  },
  {
    id: 's3',
    name: 'Usman Tariq',
    SPUserName: 'usman.tariq',
    contact: '0333-1112223',
    address1: 'Jinnah Avenue',
    address2: 'Sector F-7',
    city: 'Islamabad',
    telephone1: '051-2223334',
    telephone2: '051-2223335',
    fax: '051-2223336',
    email: 'usman.tariq@example.com',
    commission: 2,
    commissionPercent: 2,
    commissionAmount: 4000,
    MTarget: 200000,
    MtargetQty: 80,
    targetAmount: 200000,
    targetQuantity: 80,
    JanT: 180000,
    FebT: 195000,
    MarchT: 210000,
    AprilT: 190000,
    MayT: 205000,
    JuneT: 175000,
    JulyT: 215000,
    AugT: 200000,
    SeptT: 208000,
    OctT: 225000,
    NovT: 240000,
    DecT: 260000,
    active: false,
    createdDate: '2026-03-10',
  },
];

export const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Federal', 'AJK', 'GB'];
export const TAX_TYPES  = ['GST', 'SST', 'WHT', 'FED', 'Excise', 'Other'];

export const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Private Limited',
  'Public Limited',
  'NGO / Non-Profit',
  'Government Entity',
  'Branch Office',
  'Other',
];

export const seedCompanies: Company[] = [
  {
    id: 'co1',
    name: 'Acme Corporation',
    ntn: '1234567-8',
    stn: '03-00-1234-567-89',
    cnic: '35202-1234567-1',
    email: 'info@acme.com',
    phone: '042-35711111',
    mobile: '0300-1234567',
    website: 'https://www.acme.com',
    pral_token: 'pral_live_abc123xyz',
    city: 'Lahore',
    zip_code: '54000',
    business_type: 'Private Limited',
    address3: 'Main Boulevard, Gulberg III, Lahore',
    is_active: true,
  },
  {
    id: 'co2',
    name: 'Horizon Traders',
    ntn: '9876543-2',
    stn: '05-00-9876-543-21',
    cnic: '42201-9876543-2',
    email: 'contact@horizontraders.pk',
    phone: '021-34567890',
    mobile: '0321-7654321',
    website: 'https://www.horizontraders.pk',
    pral_token: '',
    city: 'Karachi',
    zip_code: '75500',
    business_type: 'Partnership',
    address3: 'I.I. Chundrigar Road, Clifton, Karachi',
    is_active: true,
  },
  {
    id: 'co3',
    name: 'Alpha Enterprises',
    ntn: '5551234-9',
    stn: '',
    cnic: '61101-5551234-3',
    email: 'alpha@enterprises.com.pk',
    phone: '051-2223334',
    mobile: '0333-1112223',
    website: '',
    pral_token: '',
    city: 'Islamabad',
    zip_code: '44000',
    business_type: 'Sole Proprietorship',
    address3: 'Jinnah Avenue, Sector F-7, Islamabad',
    is_active: false,
  },
  {
    id: 'co4',
    name: 'Beta Solutions Pvt Ltd',
    ntn: '3334445-7',
    stn: '08-00-3334-445-67',
    cnic: '37405-3334445-5',
    email: 'info@betasolutions.pk',
    phone: '041-8732200',
    mobile: '0311-9988776',
    website: 'https://betasolutions.pk',
    pral_token: 'pral_test_def456uvw',
    city: 'Faisalabad',
    zip_code: '38000',
    business_type: 'Private Limited',
    address3: 'D-Ground, Peoples Colony, Faisalabad',
    is_active: true,
  },
];

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  address: string;
  is_head_office: boolean;
}

export const seedBranches: Branch[] = [
  { id: 'br-1', companyId: 'co1', name: 'Lahore Head Office', address: 'Main Boulevard, Gulberg III, Lahore', is_head_office: true },
  { id: 'br-2', companyId: 'co1', name: 'Karachi Branch', address: 'DHA Phase 6, Karachi', is_head_office: false },
  { id: 'br-3', companyId: 'co2', name: 'Karachi Head Office', address: 'I.I. Chundrigar Road, Clifton, Karachi', is_head_office: true },
  { id: 'br-4', companyId: 'co4', name: 'Faisalabad Head Office', address: 'D-Ground, Peoples Colony, Faisalabad', is_head_office: true },
];

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  roles: string[];
  isActive: boolean;
  allowedIps: string;
  companyIds: string[];
  defaultCompanyId: string;
  branchIds: string[];
  password?: string;
}

export const ROLES = ['Admin', 'Manager', 'Salesperson', 'Operator', 'Viewer'];

export const seedUsers: UserRecord[] = [
  {
    id: 'u1',
    firstName: 'Aman',
    lastName: 'Khan',
    email: 'aman.khan@ledger.com',
    mobile: '0300-1112222',
    roles: ['Admin'],
    isActive: true,
    allowedIps: '192.168.1.1, 192.168.1.2',
    companyIds: ['co1', 'co2'],
    defaultCompanyId: 'co1',
    branchIds: ['br-1', 'br-2', 'br-3'],
  },
  {
    id: 'u2',
    firstName: 'Zain',
    lastName: 'Ahmed',
    email: 'zain.ahmed@ledger.com',
    mobile: '0321-4445555',
    roles: ['Manager'],
    isActive: true,
    allowedIps: '',
    companyIds: ['co1'],
    defaultCompanyId: 'co1',
    branchIds: ['br-1'],
  },
  {
    id: 'u3',
    firstName: 'Sara',
    lastName: 'Malik',
    email: 'sara.malik@ledger.com',
    mobile: '0333-8889999',
    roles: ['Operator'],
    isActive: false,
    allowedIps: '10.0.0.5',
    companyIds: ['co2', 'co4'],
    defaultCompanyId: 'co2',
    branchIds: ['br-3', 'br-4'],
  },
];


