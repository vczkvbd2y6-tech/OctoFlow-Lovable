import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Link2, Unlink, RefreshCw, Zap, CheckCircle2,
  AlertCircle, Fuel, Clock, Database
} from 'lucide-react';
import type { OctopusStatus } from '@/hooks/useOctopusConnection';

interface Props {
  status: OctopusStatus | null;
  loading: boolean;
  syncing: boolean;
  onConnect: (accountNumber: string, apiKey: string) => Promise<any>;
  onDisconnect: () => Promise<void>;
  onSync: () => Promise<any>;
  onRefresh: () => Promise<void>;
}

export default function OctopusConnectionCard({
  status, loading, syncing, onConnect, onDisconnect, onSync, onRefresh
}: Props) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = async () => {
    if (!accountNumber.trim() || !apiKey.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Enter both your account number and API key.' });
      return;
    }
    setConnecting(true);
    try {
      const result = await onConnect(accountNumber.trim(), apiKey.trim());
      toast({ title: 'Connected!', description: `Found ${result.meters_found} meter(s). You can now sync usage data.` });
      setShowForm(false);
      setAccountNumber('');
      setApiKey('');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Connection failed', description: err.message });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect();
      toast({ title: 'Disconnected', description: 'Octopus account unlinked and all imported data removed.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    try {
      const result = await onSync();
      toast({ title: 'Sync complete', description: `Imported ${result.days_imported} day(s) of usage data.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Sync failed', description: err.message });
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="size-5 animate-spin text-[var(--color-primary)]" />
        </div>
      </div>
    );
  }

  // Connected state
  if (status?.connected) {
    const lastSync = status.last_synced_at
      ? new Date(status.last_synced_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'Never';
    const elecMeters = status.meters?.filter(m => m.fuel_type === 'electricity' && !m.is_export) || [];
    const exportMeters = status.meters?.filter(m => m.is_export) || [];
    const gasMeters = status.meters?.filter(m => m.fuel_type === 'gas') || [];

    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold text-[var(--text-default)] flex items-center gap-2">
            <Zap className="size-4 text-[var(--color-emphasis)]" /> Octopus Energy Connection
          </h3>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-green)]">
            <CheckCircle2 className="size-3.5" /> Connected
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-subtle)]">Account</span>
            <span className="font-medium text-[var(--text-default)] font-mono text-xs">{status.account_number}</span>
          </div>

          {elecMeters.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-subtle)] flex items-center gap-1.5"><Zap className="size-3" /> Electricity meters</span>
              <span className="font-medium text-[var(--text-default)]">{elecMeters.length}</span>
            </div>
          )}
          {exportMeters.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-subtle)] flex items-center gap-1.5"><Zap className="size-3" /> Export meters</span>
              <span className="font-medium text-[var(--text-default)]">{exportMeters.length}</span>
            </div>
          )}
          {gasMeters.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-subtle)] flex items-center gap-1.5"><Fuel className="size-3" /> Gas meters</span>
              <span className="font-medium text-[var(--text-default)]">{gasMeters.length}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-subtle)] flex items-center gap-1.5"><Clock className="size-3" /> Last synced</span>
            <span className="font-medium text-[var(--text-default)] text-xs">{lastSync}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-subtle)] flex items-center gap-1.5"><Database className="size-3" /> Usage days stored</span>
            <span className="font-medium text-[var(--text-default)]">{status.usage_days_stored ?? 0}</span>
          </div>

          {status.sync_status === 'error' && status.sync_error && (
            <div className="rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20 px-3 py-2 flex items-start gap-2">
              <AlertCircle className="size-3.5 text-[var(--color-accent-rose)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--color-accent-rose)]">{status.sync_error}</p>
            </div>
          )}

          {elecMeters[0]?.tariff_code && (
            <div className="rounded-lg bg-[var(--bg-surface)] px-3 py-2">
              <p className="text-[10px] text-[var(--text-muted)] uppercase mb-0.5">Current tariff code</p>
              <p className="text-xs font-mono font-medium text-[var(--text-default)]">{elecMeters[0].tariff_code}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-1.5 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] text-white font-semibold"
            >
              {syncing ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              {syncing ? 'Syncing...' : 'Sync Usage'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              className="gap-1.5 border-[var(--border-default)] text-[var(--text-subtle)]"
            >
              <RefreshCw className="size-3" /> Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="gap-1.5 border-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)] hover:bg-[var(--color-accent-rose)]/10 ml-auto"
            >
              {disconnecting ? <Loader2 className="size-3 animate-spin" /> : <Unlink className="size-3" />}
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Disconnected state
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold text-[var(--text-default)] flex items-center gap-2">
          <Zap className="size-4 text-[var(--color-emphasis)]" /> Octopus Energy Connection
        </h3>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Link your Octopus Energy account to import real usage data and get personalized tariff comparisons on the <strong className="text-[var(--text-subtle)]">Octopus Tariffs</strong> page.
          </p>
          <div className="rounded-lg bg-[var(--bg-surface)] p-3 space-y-1.5">
            <p className="text-xs font-medium text-[var(--text-default)]">What you'll need:</p>
            <ul className="text-xs text-[var(--text-muted)] space-y-1 list-disc pl-4">
              <li>Your Octopus account number (e.g. A-ABCD1234)</li>
              <li>Your API key from <a href="https://octopus.energy/dashboard/new/accounts/personal-details/api-access" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">octopus.energy/dashboard</a></li>
            </ul>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Your credentials are stored securely on our server and never exposed in your browser.</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] text-white font-semibold"
          >
            <Link2 className="size-4" /> Connect Octopus Account
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="oct-acc" className="text-xs text-[var(--text-subtle)]">Account Number</Label>
            <Input
              id="oct-acc"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="A-ABCD1234"
              className="mt-1 bg-[var(--bg-surface)] border-[var(--border-default)] font-mono text-sm"
            />
          </div>
          <div>
            <Label htmlFor="oct-key" className="text-xs text-[var(--text-subtle)]">API Key</Label>
            <Input
              id="oct-key"
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk_live_..."
              className="mt-1 bg-[var(--bg-surface)] border-[var(--border-default)] font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="gap-1.5 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] text-white font-semibold"
            >
              {connecting ? <Loader2 className="size-3.5 animate-spin" /> : <Link2 className="size-3.5" />}
              {connecting ? 'Connecting...' : 'Connect'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setAccountNumber(''); setApiKey(''); }} className="border-[var(--border-default)]">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
