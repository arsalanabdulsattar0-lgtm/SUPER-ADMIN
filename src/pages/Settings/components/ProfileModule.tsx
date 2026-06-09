import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, TextArea } from '../../../components/ui/FormControls';
import { useTheme } from '../../../context/ThemeContext';
import { User, Building2 } from 'lucide-react';

interface ProfileModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ brand }) => {
  // User profile fields
  const [name, setName] = useState('Arsalan Abdul Sattar');
  const [email, setEmail] = useState('arsalan@lgtm.com');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [role] = useState('Administrator');

  // Company / sender fields (used on invoices)
  const [senderName, setSenderName] = useState('Antigravity Creative Studio');
  const [senderEmail, setSenderEmail] = useState('contact@antigravity.studio');
  const [senderPhone, setSenderPhone] = useState('+1 (555) 012-3456');
  const [senderAddress, setSenderAddress] = useState(
    '452 Innovation Blvd, San Francisco, CA 94107'
  );

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Derive avatar initials from current name
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">

      {/* ── Personal Profile Card ── */}
      <Card className="rounded-2xl overflow-hidden p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
        {/* Card header bar */}
        <div className="px-4 py-2.5 flex items-center gap-2 text-white" style={{ backgroundColor: brand.primary }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <User className="w-3.5 h-3.5 text-white" />
          <h3 className="text-[11px] font-black tracking-wide">Profile Details</h3>
        </div>

        <div className="p-6 space-y-6">
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
              <p className="text-[10px] text-slate-400 mt-0.5">PNG or JPG up to 5MB.</p>
              <div className="flex gap-2 mt-2">
                <Button variant="white" size="xs">Change Photo</Button>
                <Button variant="ghost" size="xs" className="text-red-500">Remove</Button>
              </div>
            </div>
          </div>

          {/* Profile fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name *" variant="compact" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Email Address *" variant="compact" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="Phone Number" variant="compact" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input label="Role" variant="compact" value={role} disabled />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" onClick={handleSave} style={{ backgroundColor: brand.primary }}>
              {saved ? 'Changes Saved ✓' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Company / Sender Information Card ── */}
      <Card className="rounded-2xl overflow-hidden p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
        {/* Card header bar */}
        <div className="px-4 py-2.5 flex items-center gap-2 text-white" style={{ backgroundColor: brand.primary }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <Building2 className="w-3.5 h-3.5 text-white" />
          <h3 className="text-[11px] font-black tracking-wide">Company / Sender Information</h3>
          <span
            className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
            style={{ backgroundColor: brand.soft, color: brand.dark }}
          >
            Used on invoices
          </span>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[10px] font-medium text-slate-400">
            These details appear as the <strong className="text-slate-500">sender / biller</strong> on every invoice you generate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              variant="compact"
              placeholder="e.g. Antigravity Creative Studio"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
            />
            <Input
              label="Email Address *"
              variant="compact"
              type="email"
              placeholder="e.g. contact@company.com"
              value={senderEmail}
              onChange={e => setSenderEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              variant="compact"
              placeholder="e.g. +92 21 3456789"
              value={senderPhone}
              onChange={e => setSenderPhone(e.target.value)}
            />
          </div>

          <TextArea
            label="Company Address"
            placeholder="e.g. Suite #12, 3rd Floor, Commercial Plaza, Karachi"
            value={senderAddress}
            onChange={e => setSenderAddress(e.target.value)}
            className="!rounded-lg text-[11px] py-1.5 px-3 h-16"
          />

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" onClick={handleSave} style={{ backgroundColor: brand.primary }}>
              {saved ? 'Changes Saved ✓' : 'Save Sender Info'}
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
};
