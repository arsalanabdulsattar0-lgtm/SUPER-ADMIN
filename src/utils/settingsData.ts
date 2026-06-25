export interface TaxSetup { id: string; taxCode: string; taxType: string; taxRate: number; province: string; active: boolean; glAccount: string; }
export interface SalesPerson { id: string; name: string; SPUserName: string; contact: string; region?: string; target?: number; commissionRate?: number; active: boolean; branchId?: string; address1?: string; address2?: string; city?: string; telephone1?: string; telephone2?: string; fax?: string; email?: string; commission?: number; commissionPercent?: number; commissionAmount?: number; MTarget?: number; MtargetQty?: number; targetAmount?: number; targetQuantity?: number; JanT?: number; FebT?: number; MarchT?: number; AprilT?: number; MayT?: number; JuneT?: number; JulyT?: number; AugT?: number; SeptT?: number; OctT?: number; NovT?: number; DecT?: number; createdDate?: string; }
export interface Company { id: string; name: string; ntn: string; stn: string; cnic: string; email: string; phone: string; mobile: string; website: string; pral_sandbox_token: string; pral_production_token: string; city: string; zip_code: string; business_type: string; address3: string; is_active: boolean; logo?: string; industry?: string; code?: string; active?: boolean; max_companies_allowed?: number; max_branches_allowed?: number; }



export const seedTaxes: TaxSetup[] = [
  { id: 't1', taxCode: 'GST-17', taxType: 'GST', taxRate: 17, province: 'Punjab',  active: true,  glAccount: '215001' },
  { id: 't2', taxCode: 'SST-16', taxType: 'SST', taxRate: 16, province: 'Sindh',   active: true,  glAccount: '215002' },
  { id: 't3', taxCode: 'WHT-10', taxType: 'WHT', taxRate: 10, province: 'KPK',     active: false, glAccount: '215003' },
  { id: 't4', taxCode: 'FED-5',  taxType: 'FED', taxRate: 5,  province: 'Federal', active: true,  glAccount: '215004' },
];

export const seedSalespeople: SalesPerson[] = [
  {
    id: 's-arsalan',
    name: 'Arsalan Ahmed',
    SPUserName: 'arsalan.ahmed',
    contact: '0300-1234567',
    address1: 'Main Boulevard, Gulberg III',
    address2: 'Lahore Head Office',
    city: 'Lahore',
    telephone1: '042-35711111',
    telephone2: '',
    fax: '',
    email: 'arsalan.ahmed@acme.com',
    commission: 5,
    commissionPercent: 5,
    commissionAmount: 25000,
    MTarget: 1000000,
    MtargetQty: 500,
    targetAmount: 1000000,
    targetQuantity: 500,
    JanT: 900000,
    FebT: 950000,
    MarchT: 1000000,
    AprilT: 980000,
    MayT: 1020000,
    JuneT: 1050000,
    JulyT: 1100000,
    AugT: 1000000,
    SeptT: 1020000,
    OctT: 1050000,
    NovT: 1080000,
    DecT: 1150000,
    active: true,
    createdDate: '2026-06-13',
  },
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
    id: 'co1', name: 'Acme Corporation', ntn: '1234567-8', stn: '03-00-1234-567-89',
    cnic: '35202-1234567-1', email: 'info@acme.com', phone: '042-35711111',
    mobile: '0300-1234567', website: 'https://www.acme.com', pral_sandbox_token: '', pral_production_token: 'pral_live_abc123xyz',
    city: 'Lahore', zip_code: '54000', business_type: 'Private Limited',
    address3: 'Main Boulevard, Gulberg III, Lahore', is_active: true,
    max_companies_allowed: 1, max_branches_allowed: 5,
  },
  {
    id: 'co2', name: 'Horizon Traders', ntn: '9876543-2', stn: '05-00-9876-543-21',
    cnic: '42201-9876543-2', email: 'contact@horizontraders.pk', phone: '021-34567890',
    mobile: '0321-7654321', website: 'https://www.horizontraders.pk', pral_sandbox_token: '', pral_production_token: '',
    city: 'Karachi', zip_code: '75500', business_type: 'Partnership',
    address3: 'I.I. Chundrigar Road, Clifton, Karachi', is_active: true,
    max_companies_allowed: 2, max_branches_allowed: 10,
  },
  {
    id: 'co3', name: 'Alpha Enterprises', ntn: '5551234-9', stn: '',
    cnic: '61101-5551234-3', email: 'alpha@enterprises.com.pk', phone: '051-2223334',
    mobile: '0333-1112223', website: '', pral_sandbox_token: '', pral_production_token: '',
    city: 'Islamabad', zip_code: '44000', business_type: 'Sole Proprietorship',
    address3: 'Jinnah Avenue, Sector F-7, Islamabad', is_active: false,
    max_companies_allowed: 1, max_branches_allowed: 1,
  },
  {
    id: 'co4', name: 'Beta Solutions Pvt Ltd', ntn: '3334445-7', stn: '08-00-3334-445-67',
    cnic: '37405-3334445-5', email: 'info@betasolutions.pk', phone: '041-8732200',
    mobile: '0311-9988776', website: 'https://betasolutions.pk', pral_sandbox_token: 'pral_test_def456uvw', pral_production_token: '',
    city: 'Faisalabad', zip_code: '38000', business_type: 'Private Limited',
    address3: 'D-Ground, Peoples Colony, Faisalabad', is_active: true,
  },
  {
    id: 'co5', name: 'Zafar & Sons Trading', ntn: '7778889-1', stn: '02-00-7778-889-12',
    cnic: '34201-7778889-1', email: 'zafarsons@gmail.com', phone: '042-37241100',
    mobile: '0345-1122334', website: '', pral_sandbox_token: '', pral_production_token: '',
    city: 'Lahore', zip_code: '54660', business_type: 'Partnership',
    address3: 'Shah Alam Market, Lahore', is_active: true,
  },
  {
    id: 'co6', name: 'Crescent Pharma Ltd', ntn: '2223334-5', stn: '05-00-2223-334-56',
    cnic: '42101-2223334-5', email: 'info@crescentpharma.pk', phone: '021-36900100',
    mobile: '0300-2233445', website: 'https://crescentpharma.pk', pral_sandbox_token: '', pral_production_token: 'pral_live_ghi789rst',
    city: 'Karachi', zip_code: '74200', business_type: 'Public Limited',
    address3: 'SITE Area, Sector 23, Karachi', is_active: true,
  },
  {
    id: 'co7', name: 'Skyline Constructions', ntn: '6667778-3', stn: '',
    cnic: '35301-6667778-3', email: 'skyline@constructions.pk', phone: '051-5551234',
    mobile: '0321-6677889', website: 'https://skylineconstructions.pk', pral_sandbox_token: '', pral_production_token: '',
    city: 'Rawalpindi', zip_code: '46000', business_type: 'Private Limited',
    address3: 'Saddar Road, Rawalpindi Cantt', is_active: true,
  },
  {
    id: 'co8', name: 'Pearl Textile Mills', ntn: '4445556-2', stn: '08-00-4445-556-23',
    cnic: '37301-4445556-2', email: 'pearltextile@yahoo.com', phone: '041-2630044',
    mobile: '0333-4455667', website: '', pral_sandbox_token: 'pral_test_jkl012mno', pral_production_token: '',
    city: 'Faisalabad', zip_code: '38600', business_type: 'Sole Proprietorship',
    address3: 'Millat Road, Faisalabad', is_active: false,
  },
  {
    id: 'co9', name: 'United Agro Farms', ntn: '1112223-6', stn: '',
    cnic: '36302-1112223-6', email: 'unitedagro@farms.pk', phone: '055-3841122',
    mobile: '0312-1122334', website: '', pral_sandbox_token: '', pral_production_token: '',
    city: 'Gujranwala', zip_code: '52250', business_type: 'Partnership',
    address3: 'GT Road, Kamoke, Gujranwala', is_active: true,
  },
  {
    id: 'co10', name: 'Swift Logistics Pvt Ltd', ntn: '8889990-4', stn: '03-00-8889-990-45',
    cnic: '35202-8889990-4', email: 'swift@logistics.pk', phone: '042-35920000',
    mobile: '0300-8899001', website: 'https://swiftlogistics.pk', pral_sandbox_token: '', pral_production_token: 'pral_live_pqr345stu',
    city: 'Lahore', zip_code: '54810', business_type: 'Private Limited',
    address3: 'Transport House, Thokar Niaz Baig, Lahore', is_active: true,
  },
  {
    id: 'co11', name: 'Nova Tech Systems', ntn: '5556667-8', stn: '06-00-5556-667-89',
    cnic: '61101-5556667-8', email: 'info@novatech.pk', phone: '051-2876543',
    mobile: '0345-5566778', website: 'https://novatech.pk', pral_sandbox_token: '', pral_production_token: '',
    city: 'Islamabad', zip_code: '44230', business_type: 'Private Limited',
    address3: 'Blue Area, Islamabad', is_active: true,
  },
  {
    id: 'co12', name: 'Mehran Exports', ntn: '3338889-0', stn: '',
    cnic: '42301-3338889-0', email: 'mehranexports@hotmail.com', phone: '021-32570099',
    mobile: '0322-3344556', website: '', pral_sandbox_token: '', pral_production_token: '',
    city: 'Karachi', zip_code: '74000', business_type: 'Sole Proprietorship',
    address3: 'Export Processing Zone, Karachi', is_active: false,
  },
  {
    id: 'co13', name: 'GreenLeaf Foods Ltd', ntn: '7772223-1', stn: '08-00-7772-223-12',
    cnic: '37405-7772223-1', email: 'greenleaf@foods.pk', phone: '041-8844100',
    mobile: '0311-7788990', website: 'https://greenleaffoods.pk', pral_sandbox_token: 'pral_test_vwx678yza', pral_production_token: '',
    city: 'Faisalabad', zip_code: '38700', business_type: 'Public Limited',
    address3: 'Jaranwala Road, Faisalabad', is_active: true,
  },
  {
    id: 'co14', name: 'Regal Motors', ntn: '2227778-5', stn: '05-00-2227-778-56',
    cnic: '42201-2227778-5', email: 'regalmotors@pk.com', phone: '021-35280099',
    mobile: '0321-2233445', website: 'https://regalmotors.pk', pral_sandbox_token: '', pral_production_token: '',
    city: 'Karachi', zip_code: '75300', business_type: 'Partnership',
    address3: 'Auto Parts Market, Sohrab Goth, Karachi', is_active: true,
  },
];


export interface Branch {
  id: string;
  companyId: string;
  name: string;
  code: string;
  address: string;
  is_head_office: boolean;
}

export const seedBranches: Branch[] = [
  { id: 'br-1', companyId: 'co1', name: 'Lahore Head Office', code: 'LHO', address: 'Main Boulevard, Gulberg III, Lahore', is_head_office: true },
  { id: 'br-2', companyId: 'co1', name: 'Karachi Branch', code: 'KHI', address: 'DHA Phase 6, Karachi', is_head_office: false },
  { id: 'br-3', companyId: 'co2', name: 'Karachi Head Office', code: 'KHO', address: 'I.I. Chundrigar Road, Clifton, Karachi', is_head_office: true },
  { id: 'br-4', companyId: 'co4', name: 'Faisalabad Head Office', code: 'FHO', address: 'D-Ground, Peoples Colony, Faisalabad', is_head_office: true },
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
    id: 'u-arsalan',
    firstName: 'Arsalan',
    lastName: 'Ahmed',
    email: 'arsalan.ahmed@acme.com',
    mobile: '0300-1234567',
    roles: ['Admin'],
    isActive: true,
    allowedIps: '',
    companyIds: ['co1', 'co2'],
    defaultCompanyId: 'co1',
    branchIds: ['br-1', 'br-2', 'br-3', 'br-4'],
  },
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

export interface PrintTemplate {
  template_id: string;
  template_name: string;
  document_type: string;
  is_default: boolean;
  is_active: boolean;
  // Advanced Page Options
  paper_size: 'A4' | 'Letter' | 'Thermal' | 'Custom';
  paper_width?: string;
  paper_height?: string;
  orientation: 'Portrait' | 'Landscape';
  logo_url?: string;
  logo_size?: number;
  qr_enabled: boolean;
  barcode_enabled: boolean;
  signature_enabled: boolean;
  watermark_enabled: boolean;
  terms_enabled: boolean;
  remarks_enabled: boolean;
  layout_mode?: 'flow' | 'free';
}

export interface PrintTemplateSection {
  section_id: string;
  template_id: string;
  section_name: string;
  display_order: number;
  is_visible: boolean;
  spacing?: number;
  layout?: 'grid' | 'flex' | 'row';
}


// ── Formula Builder Types ────────────────────────────────────────────────────
export interface FormulaToken {
  type: 'field' | 'operator' | 'constant';
  // For type='field': key from FORMULA_FIELD_OPTIONS
  fieldKey?: string;
  fieldLabel?: string;
  // For type='operator': +, -, *, /
  operator?: '+' | '-' | '*' | '/';
  // For type='constant': numeric literal
  constant?: number;
}

export const FORMULA_FIELD_OPTIONS: { key: string; label: string; section: string }[] = [
  { key: 'subtotal',          label: 'Subtotal',          section: 'Totals' },
  { key: 'tax_amount',        label: 'Tax Amount',         section: 'Totals' },
  { key: 'discount_amount',   label: 'Discount Amount',    section: 'Totals' },
  { key: 'shipping_charges',  label: 'Shipping Charges',   section: 'Totals' },
  { key: 'other_charges',     label: 'Other Charges',      section: 'Totals' },
  { key: 'round_off',         label: 'Round Off',          section: 'Totals' },
  { key: 'grand_total',       label: 'Grand Total',        section: 'Totals' },
  { key: 'paid_amount',       label: 'Paid Amount',        section: 'Totals' },
  { key: 'balance_due',       label: 'Balance Due',        section: 'Totals' },
  { key: 'total_qty',         label: 'Total Qty',          section: 'Summary' },
  { key: 'total_items',       label: 'Total Items',        section: 'Summary' },
  { key: 'line_qty',          label: 'Line Qty',           section: 'Column' },
  { key: 'line_unit_price',   label: 'Line Unit Price',    section: 'Column' },
  { key: 'line_total',        label: 'Line Total',         section: 'Column' },
  { key: 'line_discount',     label: 'Line Discount',      section: 'Column' },
  { key: 'line_tax',          label: 'Line Tax',           section: 'Column' },
];

export interface PrintTemplateField {
  field_id: string;
  template_id: string;
  section_name: string;
  field_name: string;
  field_type: 'text' | 'number' | 'date' | 'currency' | 'multiline';
  display_order: number;
  is_visible: boolean;
  row_position?: number;
  column_position?: number;
  // Styling properties
  font_size?: number;
  alignment?: 'left' | 'center' | 'right';
  is_bold?: boolean;
  color?: string;
  border?: string;
  background?: string;
  padding?: string;
  width_percent?: number;
  custom_label?: string;
  margin_bottom?: number;
  label_color?: string;
  label_is_bold?: boolean;
  value_color?: string;
  value_is_bold?: boolean;
  // Free Layout properties
  position_x?: number;
  position_y?: number;
  width_px?: number;
  height_px?: number;
  font_weight?: string;
  margin_left?: number;
  margin_right?: number;
  margin_top?: number;
  custom_css?: string;
  required?: boolean;
  options?: string[];
  default_value?: string;
}


export interface PrintTemplateCustomField {
  custom_field_id: string;
  template_id: string;
  field_name: string;
  field_type: 'text' | 'number' | 'date' | 'currency' | 'multiline' | 'boolean' | 'dropdown' | 'checkbox' | 'radio' | 'formula';
  default_value: string;
  formula_tokens?: FormulaToken[];
  display_order: number;
  is_visible: boolean;
  section_name?: string;
  custom_label?: string;
  row_position?: number;
  column_position?: number;
  // Styling properties
  font_size?: number;
  alignment?: 'left' | 'center' | 'right';
  is_bold?: boolean;
  color?: string;
  border?: string;
  background?: string;
  padding?: string;
  width_percent?: number;
  margin_bottom?: number;
  label_color?: string;
  label_is_bold?: boolean;
  value_color?: string;
  value_is_bold?: boolean;
  // Free Layout properties
  position_x?: number;
  position_y?: number;
  width_px?: number;
  height_px?: number;
  font_weight?: string;
  margin_left?: number;
  margin_right?: number;
  margin_top?: number;
  custom_css?: string;
  required?: boolean;
  options?: string[];
}

export interface PrintTemplateColumn {
  column_id: string;
  template_id: string;
  column_name: string;
  display_order: number;
  is_visible: boolean;
  custom_label?: string;
  width?: string;
  alignment?: 'left' | 'center' | 'right';
  is_custom?: boolean;
  formula_tokens?: FormulaToken[];
}

export const seedPrintTemplates: PrintTemplate[] = [
  // ── Sales Invoice (3 templates) ─────────────────────────────────────────────
  {
    template_id: 'si-1', template_name: 'Retail Invoice',
    document_type: 'Sales Invoice', paper_size: 'Thermal', orientation: 'Portrait',
    is_default: true, is_active: true,
    logo_size: 60, qr_enabled: true, barcode_enabled: true,
    signature_enabled: false, watermark_enabled: false,
    terms_enabled: false, remarks_enabled: true,
  },
  {
    template_id: 'si-3', template_name: 'Delivery Invoice',
    document_type: 'Sales Invoice', paper_size: 'A4', orientation: 'Portrait',
    is_default: false, is_active: true,
    logo_size: 80, qr_enabled: true, barcode_enabled: true,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: true, remarks_enabled: true,
  },
  {
    template_id: 'si-4', template_name: 'Tax Invoice',
    document_type: 'Sales Invoice', paper_size: 'A4', orientation: 'Portrait',
    is_default: false, is_active: true,
    logo_size: 80, qr_enabled: true, barcode_enabled: false,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: true, remarks_enabled: true,
  },

  // ── Sales Return (1 template) ───────────────────────────────────────────────
  {
    template_id: 'srt-1', template_name: 'Sales Return Invoice',
    document_type: 'Sales Return', paper_size: 'A4', orientation: 'Portrait',
    is_default: true, is_active: true,
    logo_size: 80, qr_enabled: false, barcode_enabled: false,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: true, remarks_enabled: true,
  },

  // ── Product List (1 template) ───────────────────────────────────────────────
  {
    template_id: 'pl-1', template_name: 'Standard Product List',
    document_type: 'Product List', paper_size: 'A4', orientation: 'Portrait',
    is_default: true, is_active: true,
    logo_size: 80, qr_enabled: false, barcode_enabled: false,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: false, remarks_enabled: true,
  },

  // ── Business Partner List (1 template) ──────────────────────────────────────
  {
    template_id: 'bpl-1', template_name: 'Standard Business Partner List',
    document_type: 'Business Partner List', paper_size: 'A4', orientation: 'Landscape',
    is_default: true, is_active: true,
    logo_size: 80, qr_enabled: false, barcode_enabled: false,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: false, remarks_enabled: true,
  },

  // ── Purchase List (1 template) ──────────────────────────────────────────────
  {
    template_id: 'pul-1', template_name: 'Standard Purchase List',
    document_type: 'Purchase List', paper_size: 'A4', orientation: 'Landscape',
    is_default: true, is_active: true,
    logo_size: 80, qr_enabled: false, barcode_enabled: false,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: false, remarks_enabled: true,
  },

  // ── Purchase Invoice (1 template) ──────────────────────────────────────────
  {
    template_id: 'pi-1', template_name: 'Standard Purchase Invoice',
    document_type: 'Purchase Invoice', paper_size: 'A4', orientation: 'Portrait',
    is_default: true, is_active: true,
    logo_size: 80, qr_enabled: true, barcode_enabled: false,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: true, remarks_enabled: true,
  },

  // ── Purchase Return (1 template) ───────────────────────────────────────────
  {
    template_id: 'pr-1', template_name: 'Standard Purchase Return',
    document_type: 'Purchase Return', paper_size: 'A4', orientation: 'Portrait',
    is_default: true, is_active: true,
    logo_size: 80, qr_enabled: true, barcode_enabled: false,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: true, remarks_enabled: true,
  },

  // ── BP Ledger (1 template) ──────────────────────────────────────────────────
  {
    template_id: 'bpledger-1', template_name: 'Business Partner Ledger (Detailed)',
    document_type: 'BP Ledger', paper_size: 'A4', orientation: 'Portrait',
    is_default: true, is_active: true,
    logo_size: 80, qr_enabled: false, barcode_enabled: false,
    signature_enabled: true, watermark_enabled: false,
    terms_enabled: false, remarks_enabled: false,
  },
];


export const getSeedTemplateSections = (templateId: string): PrintTemplateSection[] => {
  const isList = templateId.startsWith('pl-') || templateId.startsWith('bpl-') || templateId.startsWith('sl-') || templateId.startsWith('prl-') || templateId.includes('list') || templateId.startsWith('pul-');
  return [
    { section_id: `sec-${templateId}-1`, template_id: templateId, section_name: 'Company Information', display_order: 1, is_visible: true },
    { section_id: `sec-${templateId}-2`, template_id: templateId, section_name: 'Business Partner Information', display_order: 2, is_visible: !isList },
    { section_id: `sec-${templateId}-3`, template_id: templateId, section_name: 'Invoice Information', display_order: 3, is_visible: !isList },
    { section_id: `sec-${templateId}-4`, template_id: templateId, section_name: 'Product Table', display_order: 4, is_visible: true },
    { section_id: `sec-${templateId}-5`, template_id: templateId, section_name: 'Custom Fields', display_order: 5, is_visible: !isList },
    { section_id: `sec-${templateId}-6`, template_id: templateId, section_name: 'Totals', display_order: 6, is_visible: !isList },
    { section_id: `sec-${templateId}-7`, template_id: templateId, section_name: 'Attachments', display_order: 7, is_visible: false },
    { section_id: `sec-${templateId}-8`, template_id: templateId, section_name: 'Footer', display_order: 8, is_visible: true },
  ];
};

export const getInitialRowCol = (fieldName: string, sectionName: string, displayOrder: number): { row_position: number; column_position: number } => {
  if (sectionName === 'Company Information') {
    if (fieldName === 'Company Name') return { row_position: 1, column_position: 1 };
    if (fieldName === 'Company Logo') return { row_position: 1, column_position: 2 };
    if (fieldName === 'Company Address') return { row_position: 2, column_position: 1 };
    if (fieldName === 'Phone') return { row_position: 3, column_position: 1 };
    if (fieldName === 'Email') return { row_position: 4, column_position: 1 };
    if (fieldName === 'Website') return { row_position: 5, column_position: 1 };
    if (fieldName === 'NTN') return { row_position: 6, column_position: 1 };
    if (fieldName === 'STRN') return { row_position: 6, column_position: 2 };
    if (fieldName === 'FBR Logo') return { row_position: 1, column_position: 3 };
    return { row_position: displayOrder + 1, column_position: 1 };
  }
  if (sectionName === 'Business Partner Information') {
    if (fieldName === 'Business Partner Name') return { row_position: 1, column_position: 1 };
    if (fieldName === 'Business Partner Address') return { row_position: 2, column_position: 1 };
    if (fieldName === 'Mobile') return { row_position: 3, column_position: 1 };
    if (fieldName === 'Business Partner Email') return { row_position: 4, column_position: 1 };
    if (fieldName === 'Business Partner NTN') return { row_position: 1, column_position: 2 };
    if (fieldName === 'Business Partner STRN') return { row_position: 2, column_position: 2 };
    if (fieldName === 'Business Partner CNIC') return { row_position: 3, column_position: 2 };
    if (fieldName === 'Business Partner Code') return { row_position: 4, column_position: 2 };
    const idx = displayOrder - 1;
    const row = Math.floor(idx / 2) + 1;
    const col = (idx % 2) + 1;
    return { row_position: row, column_position: col };
  }
  if (sectionName === 'Invoice Information') {
    if (fieldName === 'Invoice Number') return { row_position: 1, column_position: 1 };
    if (fieldName === 'Date') return { row_position: 2, column_position: 1 };
    if (fieldName === 'Due Date') return { row_position: 3, column_position: 1 };
    if (fieldName === 'Warehouse') return { row_position: 1, column_position: 2 };
    if (fieldName === 'Sales Person') return { row_position: 2, column_position: 2 };
    if (fieldName === 'Reference Number') return { row_position: 3, column_position: 2 };
    if (fieldName === 'Payment Terms') return { row_position: 4, column_position: 1 };
    if (fieldName === 'FBR Invoice Number') return { row_position: 4, column_position: 2 };
    const idx = displayOrder - 1;
    const row = Math.floor(idx / 2) + 1;
    const col = (idx % 2) + 1;
    return { row_position: row, column_position: col };
  }
  if (sectionName === 'Totals') {
    return { row_position: displayOrder, column_position: 1 };
  }
  if (sectionName === 'Footer') {
    if (fieldName === 'Remarks') return { row_position: 1, column_position: 1 };
    if (fieldName === 'Terms & Conditions') return { row_position: 2, column_position: 1 };
    if (fieldName === 'Notes') return { row_position: 3, column_position: 1 };
    if (fieldName === 'Prepared By') return { row_position: 4, column_position: 1 };
    if (fieldName === 'Received By') return { row_position: 4, column_position: 2 };
    if (fieldName === 'Signature') return { row_position: 4, column_position: 3 };
    if (fieldName === 'Company Stamp') return { row_position: 5, column_position: 1 };
    if (fieldName === 'QR Code') return { row_position: 5, column_position: 2 };
    if (fieldName === 'Barcode') return { row_position: 5, column_position: 3 };
    return { row_position: displayOrder + 4, column_position: 1 };
  }
  return { row_position: displayOrder, column_position: 1 };
};

export const getSeedTemplateFields = (templateId: string): PrintTemplateField[] => {
  const fields: Omit<PrintTemplateField, 'field_id' | 'template_id'>[] = [
    // Company Information
    { section_name: 'Company Information', field_name: 'Company Logo', field_type: 'text', display_order: 1, is_visible: true, font_size: 12, alignment: 'left', is_bold: false, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 75, position_y: 2, width_percent: 20 },
    { section_name: 'Company Information', field_name: 'Company Name', field_type: 'text', display_order: 2, is_visible: true, font_size: 18, alignment: 'left', is_bold: true, color: '#1E3A8A', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 2, width_percent: 50 },
    { section_name: 'Company Information', field_name: 'Company Address', field_type: 'text', display_order: 3, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 7, width_percent: 50 },
    { section_name: 'Company Information', field_name: 'Phone', field_type: 'text', display_order: 4, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 12, width_percent: 50 },
    { section_name: 'Company Information', field_name: 'Email', field_type: 'text', display_order: 5, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 15, width_percent: 50 },
    { section_name: 'Company Information', field_name: 'Website', field_type: 'text', display_order: 6, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 18, width_percent: 50 },
    { section_name: 'Company Information', field_name: 'NTN', field_type: 'text', display_order: 7, is_visible: true, font_size: 10, alignment: 'left', is_bold: true, color: '#1E3A8A', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 21, width_percent: 25 },
    { section_name: 'Company Information', field_name: 'STRN', field_type: 'text', display_order: 8, is_visible: true, font_size: 10, alignment: 'left', is_bold: true, color: '#1E3A8A', border: 'none', background: 'transparent', padding: '0px', position_x: 30, position_y: 21, width_percent: 25 },
    { section_name: 'Company Information', field_name: 'FBR Logo', field_type: 'text', display_order: 9, is_visible: true, font_size: 10, alignment: 'right', is_bold: false, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 85, position_y: 2, width_percent: 10 },

    // Business Partner Information
    { section_name: 'Business Partner Information', field_name: 'Business Partner Name', field_type: 'text', display_order: 1, is_visible: true, font_size: 12, alignment: 'left', is_bold: true, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 26, width_percent: 45 },
    { section_name: 'Business Partner Information', field_name: 'Business Partner Address', field_type: 'text', display_order: 2, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 30, width_percent: 45 },
    { section_name: 'Business Partner Information', field_name: 'Mobile', field_type: 'text', display_order: 3, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 34, width_percent: 45 },
    { section_name: 'Business Partner Information', field_name: 'Business Partner Email', field_type: 'text', display_order: 4, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 38, width_percent: 45 },
    { section_name: 'Business Partner Information', field_name: 'Business Partner NTN', field_type: 'text', display_order: 5, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 26, width_percent: 45 },
    { section_name: 'Business Partner Information', field_name: 'Business Partner STRN', field_type: 'text', display_order: 6, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 30, width_percent: 45 },
    { section_name: 'Business Partner Information', field_name: 'Business Partner CNIC', field_type: 'text', display_order: 7, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 34, width_percent: 45 },
    { section_name: 'Business Partner Information', field_name: 'Business Partner Code', field_type: 'text', display_order: 8, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 38, width_percent: 45 },

    // Invoice Information
    { section_name: 'Invoice Information', field_name: 'Invoice Number', field_type: 'text', display_order: 1, is_visible: true, font_size: 12, alignment: 'left', is_bold: true, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 43, width_percent: 45 },
    { section_name: 'Invoice Information', field_name: 'Date', field_type: 'date', display_order: 2, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 47, width_percent: 45 },
    { section_name: 'Invoice Information', field_name: 'Due Date', field_type: 'date', display_order: 3, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 50, width_percent: 45 },
    { section_name: 'Invoice Information', field_name: 'Warehouse', field_type: 'text', display_order: 4, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 43, width_percent: 45 },
    { section_name: 'Invoice Information', field_name: 'Sales Person', field_type: 'text', display_order: 5, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 47, width_percent: 45 },
    { section_name: 'Invoice Information', field_name: 'Reference Number', field_type: 'text', display_order: 6, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 50, width_percent: 45 },
    { section_name: 'Invoice Information', field_name: 'Payment Terms', field_type: 'text', display_order: 7, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 53, width_percent: 45 },
    { section_name: 'Invoice Information', field_name: 'FBR Invoice Number', field_type: 'text', display_order: 8, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 53, width_percent: 45 },

    // Product Table
    { section_name: 'Product Table', field_name: 'Item Table', field_type: 'text', display_order: 1, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 58, width_percent: 90 },

    // Totals
    { section_name: 'Totals', field_name: 'Subtotal', field_type: 'currency', display_order: 1, is_visible: true, font_size: 10, alignment: 'right', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 60, position_y: 71, width_percent: 35 },
    { section_name: 'Totals', field_name: 'Tax Amount', field_type: 'currency', display_order: 2, is_visible: true, font_size: 10, alignment: 'right', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 60, position_y: 74, width_percent: 35 },
    { section_name: 'Totals', field_name: 'Discount Amount', field_type: 'currency', display_order: 3, is_visible: true, font_size: 10, alignment: 'right', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 60, position_y: 77, width_percent: 35 },
    { section_name: 'Totals', field_name: 'Shipping Charges', field_type: 'currency', display_order: 4, is_visible: true, font_size: 10, alignment: 'right', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 60, position_y: 80, width_percent: 35 },
    { section_name: 'Totals', field_name: 'Round Off', field_type: 'currency', display_order: 5, is_visible: true, font_size: 10, alignment: 'right', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 60, position_y: 83, width_percent: 35 },
    { section_name: 'Totals', field_name: 'Grand Total', field_type: 'currency', display_order: 6, is_visible: true, font_size: 12, alignment: 'right', is_bold: true, color: '#1E3A8A', border: 'none', background: 'transparent', padding: '0px', position_x: 60, position_y: 86, width_percent: 35 },
    { section_name: 'Totals', field_name: 'Received Amount', field_type: 'currency', display_order: 7, is_visible: true, font_size: 10, alignment: 'right', is_bold: false, color: '#4B5563', border: 'none', background: 'transparent', padding: '0px', position_x: 60, position_y: 89, width_percent: 35 },
    { section_name: 'Totals', field_name: 'Balance Due', field_type: 'currency', display_order: 8, is_visible: true, font_size: 11, alignment: 'right', is_bold: true, color: '#EF4444', border: 'none', background: 'transparent', padding: '0px', position_x: 60, position_y: 92, width_percent: 35 },

    // Footer details
    { section_name: 'Footer', field_name: 'Remarks', field_type: 'multiline', display_order: 1, is_visible: true, font_size: 9, alignment: 'left', is_bold: false, color: '#6B7280', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 71, width_percent: 50 },
    { section_name: 'Footer', field_name: 'Terms & Conditions', field_type: 'multiline', display_order: 2, is_visible: true, font_size: 9, alignment: 'left', is_bold: false, color: '#6B7280', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 76, width_percent: 50 },
    { section_name: 'Footer', field_name: 'Notes', field_type: 'multiline', display_order: 3, is_visible: true, font_size: 9, alignment: 'left', is_bold: false, color: '#6B7280', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 81, width_percent: 50 },
    { section_name: 'Footer', field_name: 'Signature', custom_label: 'Seller Signature', field_type: 'text', display_order: 4, is_visible: true, font_size: 10, alignment: 'center', is_bold: false, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 55, position_y: 87, width_percent: 25 },
    { section_name: 'Footer', field_name: 'Company Stamp', field_type: 'text', display_order: 7, is_visible: true, font_size: 10, alignment: 'center', is_bold: false, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 5, position_y: 93, width_percent: 25 },
    { section_name: 'Footer', field_name: 'QR Code', field_type: 'text', display_order: 8, is_visible: true, font_size: 10, alignment: 'left', is_bold: false, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 35, position_y: 93, width_percent: 10 },
    { section_name: 'Footer', field_name: 'Barcode', field_type: 'text', display_order: 9, is_visible: false, font_size: 10, alignment: 'left', is_bold: false, color: '#000000', border: 'none', background: 'transparent', padding: '0px', position_x: 50, position_y: 93, width_percent: 25 },
    { section_name: 'Footer', field_name: 'Watermark', field_type: 'text', display_order: 10, is_visible: false, font_size: 10, alignment: 'center', is_bold: false, color: '#E2E8F0', border: 'none', background: 'transparent', padding: '0px', position_x: 25, position_y: 40, width_percent: 50 },
  ];

  return fields.map((f, index) => {
    const initialPos = getInitialRowCol(f.field_name, f.section_name, f.display_order);
    return {
      ...f,
      field_id: `fld-${templateId}-${index + 1}`,
      template_id: templateId,
      row_position: initialPos.row_position,
      column_position: initialPos.column_position
    };
  });
};

export const getSeedTemplateColumns = (templateId: string): PrintTemplateColumn[] => {
  let columns = [
    { column_name: 'Sr No', width: '6%', is_visible: true },
    { column_name: 'Product Code', width: '12%', is_visible: true },
    { column_name: 'Product Name', width: '20%', is_visible: true },
    { column_name: 'Description', width: '16%', is_visible: true },
    { column_name: 'Batch No', width: '10%', is_visible: false },
    { column_name: 'Serial No', width: '10%', is_visible: false },
    { column_name: 'Warehouse', width: '10%', is_visible: false },
    { column_name: 'Unit', width: '8%', is_visible: false },
    { column_name: 'Qty', width: '8%', is_visible: true },
    { column_name: 'Unit Price', width: '10%', is_visible: true },
    { column_name: 'Discount', width: '8%', is_visible: true },
    { column_name: 'Tax', width: '8%', is_visible: true },
    { column_name: 'Amount', width: '12%', is_visible: true },
  ];

  if (templateId.startsWith('pl-') || templateId.includes('product') || templateId.includes('Product')) {
    columns = [
      { column_name: 'Sr No', width: '6%', is_visible: true },
      { column_name: 'Product Code', width: '14%', is_visible: true },
      { column_name: 'Product Name', width: '20%', is_visible: true },
      { column_name: 'Category', width: '14%', is_visible: true },
      { column_name: 'Purchase Price', width: '12%', is_visible: true },
      { column_name: 'Sale Price', width: '12%', is_visible: true },
      { column_name: 'Stock Qty', width: '10%', is_visible: true },
      { column_name: 'Expiry Date', width: '12%', is_visible: true },
    ];
  } else if (templateId.startsWith('pi-') || templateId.includes('purchase-invoice') || templateId.includes('Purchase Invoice')) {
    columns = [
      { column_name: 'Sr#', width: '5%', is_visible: true },
      { column_name: 'Product Code', width: '10%', is_visible: true },
      { column_name: 'Product Name', width: '18%', is_visible: true },
      { column_name: 'Batch No', width: '10%', is_visible: true },
      { column_name: 'Expiry Date', width: '10%', is_visible: true },
      { column_name: 'Quantity', width: '8%', is_visible: true },
      { column_name: 'Unit', width: '7%', is_visible: true },
      { column_name: 'Cost Price', width: '10%', is_visible: true },
      { column_name: 'Discount', width: '8%', is_visible: true },
      { column_name: 'Tax', width: '8%', is_visible: true },
      { column_name: 'Amount', width: '11%', is_visible: true },
    ];
  } else if (templateId.startsWith('pr-') || templateId.includes('purchase-return') || templateId.includes('Purchase Return')) {
    columns = [
      { column_name: 'Sr#', width: '5%', is_visible: true },
      { column_name: 'Product Code', width: '10%', is_visible: true },
      { column_name: 'Product Name', width: '18%', is_visible: true },
      { column_name: 'Batch No', width: '10%', is_visible: true },
      { column_name: 'Expiry Date', width: '10%', is_visible: true },
      { column_name: 'Return Quantity', width: '8%', is_visible: true },
      { column_name: 'Unit', width: '7%', is_visible: true },
      { column_name: 'Cost Price', width: '10%', is_visible: true },
      { column_name: 'Discount', width: '8%', is_visible: true },
      { column_name: 'Tax', width: '8%', is_visible: true },
      { column_name: 'Amount', width: '11%', is_visible: true },
    ];
  } else if (templateId.startsWith('bpl-') || templateId.includes('business') || templateId.includes('Partner') || templateId.includes('Customer')) {
    columns = [
      { column_name: 'Sr No', width: '6%', is_visible: true },
      { column_name: 'Code', width: '12%', is_visible: true },
      { column_name: 'Name', width: '20%', is_visible: true },
      { column_name: 'Type', width: '12%', is_visible: true },
      { column_name: 'Phone Number', width: '14%', is_visible: true },
      { column_name: 'City', width: '12%', is_visible: true },
      { column_name: 'Address', width: '24%', is_visible: true },
    ];
  } else if (templateId.startsWith('pul-') || templateId.includes('purchase-list') || templateId.includes('Purchase List')) {
    columns = [
      { column_name: 'Sr No', width: '4%', is_visible: true },
      { column_name: 'Purchase No', width: '8%', is_visible: true },
      { column_name: 'Business Partner Code', width: '8%', is_visible: true },
      { column_name: 'Business Partner Name', width: '10%', is_visible: true },
      { column_name: 'Invoice No', width: '8%', is_visible: true },
      { column_name: 'Purchase Date', width: '8%', is_visible: true },
      { column_name: 'Due Date', width: '8%', is_visible: true },
      { column_name: 'Branch', width: '6%', is_visible: true },
      { column_name: 'Warehouse', width: '8%', is_visible: true },
      { column_name: 'Total Amount', width: '6%', is_visible: true },
      { column_name: 'Discount', width: '5%', is_visible: true },
      { column_name: 'Tax', width: '5%', is_visible: true },
      { column_name: 'Net Amount', width: '8%', is_visible: true },
      { column_name: 'Payment Status', width: '6%', is_visible: true },
      { column_name: 'Status', width: '6%', is_visible: true },
      { column_name: 'Remarks', width: '8%', is_visible: false },
      { column_name: 'Created By', width: '8%', is_visible: false },
      { column_name: 'Created Date', width: '8%', is_visible: false },
    ];
  }

  return columns.map((col, index) => ({
    column_id: `col-${templateId}-${index + 1}`,
    template_id: templateId,
    column_name: col.column_name,
    display_order: index + 1,
    is_visible: col.is_visible,
    width: col.width
  }));
};

export const getSeedCustomFields = (templateId: string): PrintTemplateCustomField[] => [
  { custom_field_id: `cf-${templateId}-driver`, template_id: templateId, field_name: 'Driver Name', field_type: 'text', default_value: 'John Doe', display_order: 1, is_visible: false },
  { custom_field_id: `cf-${templateId}-vehicle`, template_id: templateId, field_name: 'Vehicle Number', field_type: 'text', default_value: 'LZ-9901', display_order: 2, is_visible: false },
  { custom_field_id: `cf-${templateId}-deldate`, template_id: templateId, field_name: 'Delivery Date', field_type: 'date', default_value: '2026-06-12', display_order: 3, is_visible: false },
  { custom_field_id: `cf-${templateId}-project`, template_id: templateId, field_name: 'Project Name', field_type: 'text', default_value: 'Acme Corp HQ', display_order: 4, is_visible: false },
  { custom_field_id: `cf-${templateId}-batch`, template_id: templateId, field_name: 'Batch No', field_type: 'text', default_value: 'BATCH-2026-A', display_order: 5, is_visible: false },
  { custom_field_id: `cf-${templateId}-refcode`, template_id: templateId, field_name: 'Reference Code', field_type: 'text', default_value: 'REF-XYZ-01', display_order: 6, is_visible: false },
  { custom_field_id: `cf-${templateId}-warranty`, template_id: templateId, field_name: 'Warranty No', field_type: 'text', default_value: 'W-99827-C', display_order: 7, is_visible: false },
  { custom_field_id: `cf-${templateId}-notes`, template_id: templateId, field_name: 'Custom Notes', field_type: 'multiline', default_value: 'Warranty covers manufacturer defects only.', display_order: 8, is_visible: false },
];

const resolveTokenValue = (tok: FormulaToken, context: { row?: any; totals?: any }): number => {
  if (tok.type === 'constant') {
    return tok.constant ?? 0;
  }
  if (tok.type === 'field' && tok.fieldKey) {
    const key = tok.fieldKey;
    // Row level
    if (context.row) {
      const item = context.row;
      const itemTotal = (item.quantity || 0) * (item.price || 0) - (item.discount || 0) + (item.tax || 0) + (item.furtherTax || 0);
      if (key === 'line_qty') return item.quantity || 0;
      if (key === 'line_unit_price') return item.price || 0;
      if (key === 'line_discount') return item.discount || 0;
      if (key === 'line_tax') return item.tax || 0;
      if (key === 'line_total') return itemTotal || 0;
    }
    // Totals level
    if (context.totals) {
      const totals = context.totals;
      if (key in totals) {
        return totals[key as keyof typeof totals] || 0;
      }
    }
  }
  return 0;
};

export function evaluateFormula(tokens: FormulaToken[] | undefined, context: { row?: any; totals?: any }): number {
  if (!tokens || tokens.length === 0) return 0;
  
  // Resolve values
  const values: (number | string)[] = [];
  tokens.forEach(tok => {
    if (tok.type === 'operator') {
      values.push(tok.operator || '+');
    } else {
      values.push(resolveTokenValue(tok, context));
    }
  });

  // Evaluate multiplications and divisions first
  const intermediate: (number | string)[] = [];
  let i = 0;
  while (i < values.length) {
    const current = values[i];
    if (current === '*' || current === '/') {
      const prev = intermediate.pop();
      const next = values[i + 1];
      const prevNum = typeof prev === 'number' ? prev : 0;
      const nextNum = typeof next === 'number' ? next : 0;
      
      let res = 0;
      if (current === '*') res = prevNum * nextNum;
      else if (current === '/') res = nextNum !== 0 ? prevNum / nextNum : 0;
      
      intermediate.push(res);
      i += 2;
    } else {
      intermediate.push(current);
      i++;
    }
  }

  // Evaluate additions and subtractions
  if (intermediate.length === 0) return 0;
  let total = typeof intermediate[0] === 'number' ? intermediate[0] : 0;
  let j = 1;
  while (j < intermediate.length) {
    const op = intermediate[j];
    const nextVal = intermediate[j + 1];
    const nextNum = typeof nextVal === 'number' ? nextVal : 0;
    
    if (op === '+') total += nextNum;
    else if (op === '-') total -= nextNum;
    
    j += 2;
  }
  
  return total;
}





