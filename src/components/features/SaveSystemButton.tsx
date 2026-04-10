import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSystemTracker } from '@/hooks/useSystemTracker';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Target, Calendar, Loader2, X } from 'lucide-react';
import type { SystemConfiguration, EnergyProfile, PaybackResult } from '@/types';

interface SaveSystemButtonProps {
  configuration: SystemConfiguration;
  energyProfile: EnergyProfile;
  result: PaybackResult;
}

export default function SaveSystemButton({ configuration, energyProfile, result }: SaveSystemButtonProps) {
  const { user, isSubscribed } = useAuth();
  const { saveSystem, currentSystem, saving } = useSystemTracker();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(configuration.name);
  const [installDate, setInstallDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  if (!user || !isSubscribed) {
    return null;
  }

  const handleSave = async () => {
    if (!installDate) {
      toast({ variant: 'destructive', title: 'Missing date', description: 'Please select an installation date.' });
      return;
    }

    const saved = await saveSystem(name, configuration, energyProfile, result, installDate);
    if (saved) {
      toast({
        title: 'System saved',
        description: 'Your system is now being tracked. View it from your Account.',
      });
      setShowModal(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save system.' });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setShowModal(true)}
        className="gap-2 border-[var(--color-emphasis)]/30 text-[var(--color-emphasis)] hover:bg-[var(--color-emphasis)]/10"
      >
        <Target className="size-4" />
        {currentSystem ? 'Replace My System' : 'Save as My System'}
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-[var(--color-emphasis)]" />
                <h3 className="font-display text-lg font-bold text-[var(--text-default)]">Save as My System</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-default)]">
                <X className="size-5" />
              </button>
            </div>

            {currentSystem && (
              <div className="rounded-lg border border-[var(--color-emphasis)]/20 bg-[var(--color-emphasis)]/5 p-3 mb-4">
                <p className="text-xs text-[var(--color-emphasis)] font-medium">
                  This will replace your current system "{currentSystem.name}" and reset all tracked actuals.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--text-subtle)]">System Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My EcoFlow Setup"
                  className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
                  <Calendar className="size-3.5" /> Installation Date
                </Label>
                <Input
                  type="date"
                  value={installDate}
                  onChange={(e) => setInstallDate(e.target.value)}
                  className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                  max={new Date().toISOString().slice(0, 10)}
                />
                <p className="text-[10px] text-[var(--text-muted)]">
                  This date will be the starting point for payback tracking and monthly breakdown.
                </p>
              </div>

              <div className="rounded-lg bg-[var(--bg-surface)] p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">System Cost</span>
                  <span className="font-semibold text-[var(--color-emphasis)] tabular-nums">£{result.systemCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Projected Payback</span>
                  <span className="font-semibold text-[var(--color-primary)] tabular-nums">{result.paybackYears}y {result.paybackMonths}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Annual Savings (Est.)</span>
                  <span className="font-semibold text-[var(--color-accent-green)] tabular-nums">£{result.annualSavings.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || !installDate}
                  className="flex-1 gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] text-white font-semibold"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />}
                  Save System
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)} className="border-[var(--border-default)]">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
