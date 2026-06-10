import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2, Check,
  User, ShieldCheck, Building2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader, SectionHeader } from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import { seedCompanies, seedBranches, seedUsers, ROLES } from '../../../utils/settingsData';
import type { UserRecord } from '../../../utils/settingsData';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';

interface UserManagementModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const emptyUser = (): Omit<UserRecord, 'id'> => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  mobile: '',
  roles: ['Viewer'],
  isActive: true,
  allowedIps: '',
  companyIds: [],
  defaultCompanyId: '',
  branchIds: [],
});

const PAGE_SIZE = 8;

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({ brand }) => {
  const [users, setUsers] = useState<UserRecord[]>(() => {
    try {
      const stored = localStorage.getItem('user_records');
      return stored ? JSON.parse(stored) : seedUsers;
    } catch {
      return seedUsers;
    }
  });

  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tempRole, setTempRole] = useState('all');
  const [tempStatus, setTempStatus] = useState('all');
  const [sortKey, setSortKey] = useState<keyof UserRecord>('firstName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [form, setForm] = useState<Omit<UserRecord, 'id'>>(emptyUser());
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  const [error, setError] = useState('');

  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passReadOnly, setPassReadOnly] = useState(true);

  React.useEffect(() => {
    if (showForm) {
      setEmailReadOnly(true);
      setPassReadOnly(true);
    }
  }, [showForm]);

  // Sync users list helper
  const saveUsers = (newUsers: UserRecord[]) => {
    setUsers(newUsers);
    try {
      localStorage.setItem('user_records', JSON.stringify(newUsers));
    } catch (e) {
      console.error('Failed to save user records to localStorage', e);
    }
  };

  // Sort handler
  const handleSort = (key: keyof UserRecord) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // Derived filter and sort data
  const filtered = useMemo(() => {
    return users
      .filter(u => {
        const q = search.toLowerCase();
        const matchSearch =
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.mobile.toLowerCase().includes(q);
        const matchRole = filterRole === 'all' || (u.roles && u.roles.includes(filterRole));
        const matchStatus =
          filterStatus === 'all' || (filterStatus === 'active' ? u.isActive : !u.isActive);
        return matchSearch && matchRole && matchStatus;
      })
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '').toLowerCase();
        const bv = String(b[sortKey] ?? '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [users, search, filterRole, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // CRUD events
  const openAdd = () => {
    setEditing(null);
    setForm(emptyUser());
    setError('');
    setShowForm(true);
  };

  const openEdit = (u: UserRecord) => {
    setEditing(u);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: '', // blank by default when editing
      mobile: u.mobile,
      roles: u.roles || ['Viewer'],
      isActive: u.isActive,
      allowedIps: u.allowedIps,
      companyIds: u.companyIds || [],
      defaultCompanyId: u.defaultCompanyId || '',
      branchIds: u.branchIds || [],
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!form.lastName.trim()) {
      setError('Last name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email / Username is required.');
      return;
    }
    if (!form.roles || form.roles.length === 0) {
      setError('Please select at least one role.');
      return;
    }
    if (!editing && !form.password?.trim()) {
      setError('Password is required for new users.');
      return;
    }

    const defaultCompId = form.companyIds[0] || '';
    const payload: UserRecord = editing
      ? {
          ...editing,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          mobile: form.mobile,
          roles: form.roles,
          isActive: form.isActive,
          allowedIps: form.allowedIps,
          companyIds: form.companyIds,
          defaultCompanyId: defaultCompId,
          branchIds: form.branchIds,
          ...(form.password ? { password: form.password } : {}),
        }
      : {
          id: `u-${Date.now()}`,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          mobile: form.mobile,
          roles: form.roles,
          isActive: form.isActive,
          allowedIps: form.allowedIps,
          companyIds: form.companyIds,
          defaultCompanyId: defaultCompId,
          branchIds: form.branchIds,
          password: form.password,
        };

    const nextUsers = editing
      ? users.map(u => (u.id === editing.id ? payload : u))
      : [payload, ...users];

    saveUsers(nextUsers);
    setShowForm(false);
  };

  const handleToggleActive = (id: string) => {
    const nextUsers = users.map(u => (u.id === id ? { ...u, isActive: !u.isActive } : u));
    saveUsers(nextUsers);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    const nextUsers = users.filter(u => u.id !== deleteModal.id);
    saveUsers(nextUsers);
  };

  const handleResetFilters = () => {
    setFilterRole('all');
    setFilterStatus('all');
    setTempRole('all');
    setTempStatus('all');
    setShowFilter(false);
  };

  // Checkbox handlers for companies and branches
  const handleCompanyToggle = (companyId: string) => {
    const currentCompanies = [...form.companyIds];
    const index = currentCompanies.indexOf(companyId);
    let nextCompanies: string[];

    if (index > -1) {
      nextCompanies = currentCompanies.filter(id => id !== companyId);
    } else {
      nextCompanies = [...currentCompanies, companyId];
    }

    // Filter branch selection to only keep branches belonging to currently selected companies
    const activeBranches = seedBranches.filter(b => nextCompanies.includes(b.companyId)).map(b => b.id);
    const nextBranches = form.branchIds.filter(id => activeBranches.includes(id));

    // Verify default company selection
    let nextDefaultCompany = form.defaultCompanyId;
    if (!nextCompanies.includes(nextDefaultCompany)) {
      nextDefaultCompany = nextCompanies.length > 0 ? nextCompanies[0] : '';
    }

    setForm({
      ...form,
      companyIds: nextCompanies,
      branchIds: nextBranches,
      defaultCompanyId: nextDefaultCompany,
    });
  };

  const handleBranchToggle = (branchId: string) => {
    const currentBranches = [...form.branchIds];
    const index = currentBranches.indexOf(branchId);
    let nextBranches: string[];

    if (index > -1) {
      nextBranches = currentBranches.filter(id => id !== branchId);
    } else {
      nextBranches = [...currentBranches, branchId];
    }

    setForm({
      ...form,
      branchIds: nextBranches,
    });
  };

  const handleSelectAllBranchesForCompany = (companyId: string, selectAll: boolean) => {
    const companyBranches = seedBranches.filter(b => b.companyId === companyId).map(b => b.id);
    let nextBranches = [...form.branchIds];

    if (selectAll) {
      // Add all branches of this company
      companyBranches.forEach(id => {
        if (!nextBranches.includes(id)) {
          nextBranches.push(id);
        }
      });
    } else {
      // Remove all branches of this company
      nextBranches = nextBranches.filter(id => !companyBranches.includes(id));
    }

    setForm({
      ...form,
      branchIds: nextBranches,
    });
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Name or Email..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempRole(filterRole);
              setTempStatus(filterStatus);
              setShowFilter(true);
            }}
          >
            Filter
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openAdd}
            style={{ backgroundColor: brand.primary }}
          >
            Add user
          </Button>
        </div>
      </div>

      {/* Users list table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        {/* Table header bar */}
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">User List</h3>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}
            >
              {filtered.length} users
            </span>
          </div>
        </div>

        <ScrollArea maxHeight="220px" className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    { label: 'First Name', key: 'firstName' as keyof UserRecord, w: 'min-w-[90px]' },
                    { label: 'Last Name', key: 'lastName' as keyof UserRecord, w: 'min-w-[90px]' },
                    { label: 'Email', key: 'email' as keyof UserRecord, w: 'min-w-[140px]' },
                    { label: 'Mobile', key: 'mobile' as keyof UserRecord, w: 'min-w-[95px]' },
                    { label: 'Role', key: 'roles' as keyof UserRecord, w: 'min-w-[70px]' },
                    { label: 'Companies Count', key: undefined, w: 'min-w-[95px]' },
                    { label: 'Branches Count', key: undefined, w: 'min-w-[95px]' },
                    { label: 'Status', key: undefined, w: 'min-w-[75px]' },
                    { label: 'Actions', key: undefined, w: 'w-20' },
                  ].map((h) => (
                    <TableHeader
                      key={h.label}
                      label={h.label}
                      sortKey={h.key}
                      activeSortKey={sortKey}
                      sortDir={sortDir}
                      onSort={h.key ? () => handleSort(h.key!) : undefined}
                      width={h.w}
                      padding={h.label === 'Actions' ? 'px-2' : 'px-3'}
                      borderLeft={false}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-[12px] text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                    >
                      <td className="px-3 py-2 text-[12px] font-normal text-slate-650">
                        {u.firstName}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-normal text-slate-650">
                        {u.lastName}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-normal text-slate-650">
                        {u.email}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-normal text-slate-650">
                        {u.mobile || '-'}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-normal text-slate-650">
                        {u.roles ? u.roles.join(', ') : '-'}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-normal text-slate-650">
                        {u.companyIds ? u.companyIds.length : 0}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-normal text-slate-650">
                        {u.branchIds ? u.branchIds.length : 0}
                      </td>
                      <td className="px-3 py-2">
                        {u.isActive ? (
                          <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(u.id)} />
                        ) : (
                          <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(u.id)} />
                        )}
                      </td>
                      <td className="px-2 py-2 w-20">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Pencil}
                            title="Edit"
                            className="!px-1 text-slate-500 hover:text-slate-800"
                            onClick={() => openEdit(u)}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Trash2}
                            title="Delete"
                            className="!px-1 !text-red-500"
                            onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: '#E2E8F0', background: brand.surface + '60' }}
          >
            <p className="text-[11px] font-medium text-slate-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="white"
                size="xs"
                icon={ChevronLeft}
                className="w-8 h-8 px-0"
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  variant={currentPage === p ? 'primary' : 'white'}
                  size="xs"
                  className="w-8 h-8 px-0 border-none"
                  style={currentPage === p ? { backgroundColor: brand.primary } : undefined}
                >
                  {p}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="white"
                size="xs"
                icon={ChevronRight}
                className="w-8 h-8 px-0"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Add / Edit user Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit user' : 'Add user'}
        size="xl"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSave}
              style={{ backgroundColor: brand.primary }}
            >
              {editing ? 'Update user' : 'Save user'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Dummy inputs to intercept browser autofill */}
          <input
            type="text"
            name="prevent_autofill_email"
            style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px' }}
            tabIndex={-1}
            autoComplete="username"
          />
          <input
            type="password"
            name="prevent_autofill_password"
            style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px' }}
            tabIndex={-1}
            autoComplete="new-password"
          />

          {error && (
            <div className="p-3 text-[11px] font-bold text-red-650 bg-red-50 border border-red-100 rounded-xl">
              {error}
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-1.5">
            <SectionHeader title="Basic contact details" icon={User} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  variant="compact"
                  placeholder="e.g. Aman"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                />
                <Input
                  label="Last Name *"
                  variant="compact"
                  placeholder="e.g. Khan"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                />
                <Input
                  label="Email / Username *"
                  variant="compact"
                  type="text"
                  placeholder="e.g. amankhan or aman@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="off"
                  readOnly={emailReadOnly}
                  onFocus={() => setEmailReadOnly(false)}
                  onBlur={() => setEmailReadOnly(true)}
                />
                <Input
                  label={editing ? 'Password (leave blank to keep unchanged)' : 'Password *'}
                  variant="compact"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  readOnly={passReadOnly}
                  onFocus={() => setPassReadOnly(false)}
                  onBlur={() => setPassReadOnly(true)}
                />
                <Input
                  label="Mobile Number"
                  variant="compact"
                  placeholder="e.g. 0300-1112222"
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                />
                <Input
                  label="Allowed IPs (comma separated)"
                  variant="compact"
                  placeholder="e.g. 192.168.1.1, 10.0.0.5"
                  value={form.allowedIps}
                  onChange={e => setForm({ ...form, allowedIps: e.target.value })}
                />
              </div>
            </Card>
          </div>

          {/* Section 2: Roles and privileges */}
          <div className="space-y-1.5">
            <SectionHeader title="System privileges & access level" icon={ShieldCheck} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-2">
                  <label className="text-[11px] text-black font-semibold ml-1 block">
                    Role Selection *
                  </label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 pl-1 pt-1">
                    {ROLES.map(role => {
                      const isChecked = form.roles.includes(role);
                      return (
                        <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let nextRoles = [...form.roles];
                              if (isChecked) {
                                nextRoles = nextRoles.filter(r => r !== role);
                              } else {
                                nextRoles.push(role);
                              }
                              setForm({ ...form, roles: nextRoles });
                            }}
                            className="rounded border-[#E2E8F0] text-blue-600 focus:ring-blue-500/20 cursor-pointer w-4 h-4 shadow-none"
                          />
                          <span className="text-[11px] text-slate-700 font-medium">{role}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center pt-5">
                  <Toggle
                    checked={form.isActive}
                    onChange={val => setForm({ ...form, isActive: val })}
                    label="User is Active"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Section 3: Company and Branch Assignment */}
          <div className="space-y-1.5">
            <SectionHeader title="Company & branch assignments" icon={Building2} />
            <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
              <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1">
                {seedCompanies.map(company => {
                  const isCompanyChecked = form.companyIds.includes(company.id);
                  const companyBranches = seedBranches.filter(b => b.companyId === company.id);

                  // Check if all branches of this company are selected
                  const selectedBranchesOfCompany = form.branchIds.filter(id =>
                    companyBranches.some(b => b.id === id)
                  );
                  const areAllBranchesSelected =
                    companyBranches.length > 0 &&
                    selectedBranchesOfCompany.length === companyBranches.length;

                  return (
                    <div key={company.id} className="border border-[#E2E8F0] bg-white rounded-xl p-3 space-y-2.5 shadow-none">
                      {/* Company row */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isCompanyChecked}
                            onChange={() => handleCompanyToggle(company.id)}
                            className="rounded border-[#E2E8F0] text-blue-600 focus:ring-blue-500/20 cursor-pointer w-4 h-4 shadow-none"
                          />
                          <span className="text-[12px] font-bold text-slate-700">{company.name}</span>
                        </label>

                        {/* Quick Select All branches (only show if company is checked & has branches) */}
                        {isCompanyChecked && companyBranches.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectAllBranchesForCompany(company.id, !areAllBranchesSelected)
                            }
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {areAllBranchesSelected ? 'Deselect all branches' : 'Select all branches'}
                          </button>
                        )}
                      </div>

                      {/* Branches checklist (visible only if company checked) */}
                      {isCompanyChecked && (
                        <div className="pl-6 border-l border-[#E2E8F0] space-y-2 mt-1">
                          {companyBranches.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No branches found for this company.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {companyBranches.map(branch => {
                                const isBranchChecked = form.branchIds.includes(branch.id);
                                return (
                                  <label
                                    key={branch.id}
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isBranchChecked}
                                      onChange={() => handleBranchToggle(branch.id)}
                                      className="rounded border-[#E2E8F0] text-blue-600 focus:ring-blue-500/20 cursor-pointer w-3.5 h-3.5 shadow-none"
                                    />
                                    <span className="text-[11px] font-normal text-slate-600">
                                      {branch.name} {branch.is_head_office && '(Head Office)'}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleResetFilters}
        onApply={() => {
          setFilterRole(tempRole);
          setFilterStatus(tempStatus);
          setCurrentPage(1);
          setShowFilter(false);
        }}
        title="Filter users"
      >
        {/* Role Filter */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Role</label>
          <Select
            variant="compact"
            value={tempRole}
            onChange={e => setTempRole(e.target.value)}
            options={[{ value: 'all', label: 'All roles' }, ...ROLES.map(r => ({ value: r, label: r }))]}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Status</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setTempStatus(opt.key)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer ${
                  tempStatus === opt.key
                    ? 'bg-white shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'
                }`}
                style={{ color: tempStatus === opt.key ? brand.primary : undefined }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </FilterDrawer>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete user account?"
        itemName={deleteModal.name}
        warningText="This action cannot be undone and this user will be permanently removed from the database."
      />
    </div>
  );
};
