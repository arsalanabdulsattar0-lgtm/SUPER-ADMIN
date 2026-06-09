import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/FormControls';
import { SectionHeader } from '../../../components/ui/Typography';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../context/ThemeContext';
import type { SalesPerson } from './SalesPersonModule';

interface SalesTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesPerson: SalesPerson | null;
}

export const SalesTargetsModal: React.FC<SalesTargetsModalProps> = ({
  isOpen,
  onClose,
  salesPerson,
}) => {
  const { brand } = useTheme();

  const formattedTargetAmount = salesPerson?.MTarget !== undefined
    ? salesPerson.MTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })
    : '0.00';

  const formattedTargetQty = salesPerson?.MtargetQty !== undefined
    ? salesPerson.MtargetQty.toLocaleString()
    : '0';

  const monthlyData = salesPerson
    ? [
      { label: 'January', val: salesPerson.JanT },
      { label: 'February', val: salesPerson.FebT },
      { label: 'March', val: salesPerson.MarchT },
      { label: 'April', val: salesPerson.AprilT },
      { label: 'May', val: salesPerson.MayT },
      { label: 'June', val: salesPerson.JuneT },
      { label: 'July', val: salesPerson.JulyT },
      { label: 'August', val: salesPerson.AugT },
      { label: 'September', val: salesPerson.SeptT },
      { label: 'October', val: salesPerson.OctT },
      { label: 'November', val: salesPerson.NovT },
      { label: 'December', val: salesPerson.DecT },
    ]
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sales Targets — ${salesPerson?.name || ''}`}
      size="md"
      footer={
        <Button
          variant="primary"
          size="md"
          onClick={onClose}
          style={{ backgroundColor: brand.primary }}
        >
          Close
        </Button>
      }
    >
      {salesPerson && (
        <Card className="p-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
          {/* Summary Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monthly Target (Rs.)"
              variant="compact"
              placeholder="e.g. 500,000.00"
              readOnly
              value={formattedTargetAmount}
            />
            <Input
              label="Monthly Target Qty"
              variant="compact"
              placeholder="e.g. 200"
              readOnly
              value={formattedTargetQty}
            />
          </div>

          {/* Monthly Breakdown */}
          <div className="mt-4">
            <SectionHeader title="Monthly Breakdown" className="mb-3" />
            <div className="grid grid-cols-3 gap-2">
              {monthlyData.map((m, idx) => (
                <Card
                  key={idx}
                  className="p-2.5 border rounded-xl bg-white flex flex-col gap-0.5 transition-colors"
                  style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
                >
                  <span className="text-[11px] text-black">{m.label}</span>
                  <span className="text-[11px] text-slate-600" >
                    {(m.val || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}
    </Modal>
  );
};
