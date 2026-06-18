import React, { useMemo } from 'react';
import { SectionCard } from '../../../components/ui/SectionCard';
import { useTheme } from '../../../context/ThemeContext';
import { Input, TextArea } from '../../../components/ui/FormControls';
import { User, Building2 } from 'lucide-react';
import { seedCompanies, seedBranches, seedUsers } from '../../../utils/settingsData';
import type { Company, Branch, UserRecord } from '../../../utils/settingsData';
import type { Warehouse } from './WarehouseModule';
import { seedWarehouses } from './WarehouseModule';

interface ProfileModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ brand }) => {
  // Original user details (static)
  const name = 'Arsalan Abdul Sattar';
  const email = 'arsalan@lgtm.com';
  const phone = '+92 300 1234567';


  // Original company details (static)
  const senderName = 'Antigravity Creative Studio';
  const senderEmail = 'contact@antigravity.studio';
  const senderPhone = '+1 (555) 012-3456';
  const senderAddress = '452 Innovation Blvd, San Francisco, CA 94107';

  // Load user records to resolve permissions
  const userRecords = useMemo<UserRecord[]>(() => {
    try {
      const stored = localStorage.getItem('user_records');
      return stored ? JSON.parse(stored) : seedUsers;
    } catch {
      return seedUsers;
    }
  }, []);

  // Find the active profile user (Arsalan) in seed users to fetch permissions
  const currentUser = useMemo<UserRecord>(() => {
    return userRecords.find((u: UserRecord) => u.firstName.toLowerCase() === 'arsalan') || userRecords[0];
  }, [userRecords]);

  // Load companies list to resolve company names
  const companiesList = useMemo<Company[]>(() => {
    try {
      const stored = localStorage.getItem('company_records');
      return stored ? JSON.parse(stored) : seedCompanies;
    } catch {
      return seedCompanies;
    }
  }, []);

  // Load branches list to resolve branch names
  const branchesList = useMemo<Branch[]>(() => {
    try {
      const stored = localStorage.getItem('branch_records');
      return stored ? JSON.parse(stored) : seedBranches;
    } catch {
      return seedBranches;
    }
  }, []);

  // Load warehouses list to resolve warehouse names
  const warehousesList = useMemo<Warehouse[]>(() => {
    try {
      const stored = localStorage.getItem('warehouse_records');
      return stored ? JSON.parse(stored) : seedWarehouses;
    } catch {
      return seedWarehouses;
    }
  }, []);

  // Filter permitted entities
  const permittedCompanies = useMemo<Company[]>(() => {
    return companiesList.filter((c: Company) => currentUser.companyIds.includes(c.id));
  }, [companiesList, currentUser]);

  const permittedBranches = useMemo<Branch[]>(() => {
    return branchesList.filter((b: Branch) => currentUser.branchIds.includes(b.id));
  }, [branchesList, currentUser]);

  const permittedWarehouses = useMemo<Warehouse[]>(() => {
    return warehousesList.filter((wh: Warehouse) => currentUser.branchIds.includes(wh.branchId));
  }, [warehousesList, currentUser]);

  // Format permitted entities as comma-separated strings for standard inputs
  const allowedCompaniesStr = useMemo(() => {
    return permittedCompanies.map(c => `${c.name} (${c.city})`).join(', ');
  }, [permittedCompanies]);

  const allowedBranchesStr = useMemo(() => {
    return permittedBranches.map(b => `${b.name} (${b.code})`).join(', ');
  }, [permittedBranches]);

  const allowedWarehousesStr = useMemo(() => {
    return permittedWarehouses.map(wh => {
      const parentBranch = branchesList.find(b => b.id === wh.branchId);
      const branchCode = parentBranch?.code || 'N/A';
      return `${wh.name} (${wh.code}) [${branchCode}]`;
    }).join(', ');
  }, [permittedWarehouses, branchesList]);

  // Derive initials from name
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-[calc(100vh-190px)] min-h-[550px] max-h-[850px] flex flex-col overflow-hidden">

      {/* ── Personal Profile & Company Card ── */}
      <SectionCard
        title="Profile & Company Details"
        icon={<User className="w-3.5 h-3.5 text-white" />}
        brand={brand}
        scrollable
        bodyClassName="space-y-6"
      >
        {/* Avatar row */}
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 text-xl font-bold select-none"
            style={{ borderColor: brand.primary, color: brand.primary }}
          >
            {initials}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Profile Picture</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Static profile & organization details overview.</p>
          </div>
        </div>

        {/* Profile & Permissions Section Heading */}
        <div className="border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            User Information & Access Permissions
          </h4>
        </div>

        {/* Profile & Permissions fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" variant="compact" value={name} readOnly disabled />
          <Input label="Email Address" variant="compact" type="email" value={email} readOnly disabled />
          <Input label="Phone Number" variant="compact" value={phone} readOnly disabled />
          <Input label="Role" variant="compact" value={currentUser.roles.join(', ')} readOnly disabled />
          <Input label="Allowed Companies" variant="compact" value={allowedCompaniesStr} readOnly disabled />
          <Input label="Allowed Branches" variant="compact" value={allowedBranchesStr} readOnly disabled />
          <Input label="Allowed Warehouses" variant="compact" value={allowedWarehousesStr} readOnly disabled className="col-span-1 md:col-span-2" />
        </div>

        {/* Company details Section Heading */}
        <div className="border-b border-slate-100 pt-4 pb-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Company / Sender Details (Invoice Biller Info)
          </h4>
        </div>

        {/* Company fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            variant="compact"
            value={senderName}
            readOnly
            disabled
          />
          <Input
            label="Email Address"
            variant="compact"
            type="email"
            value={senderEmail}
            readOnly
            disabled
          />
          <Input
            label="Phone Number"
            variant="compact"
            value={senderPhone}
            readOnly
            disabled
          />
          <div className="col-span-1 md:col-span-2">
            <TextArea
              label="Company Address"
              value={senderAddress}
              readOnly
              disabled
              className="!rounded-lg text-[11px] py-1.5 px-3 h-16 bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      </SectionCard>

    </div>
  );
};
