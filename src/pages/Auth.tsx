import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore, mapSupabaseUser } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sun, Mail, KeyRound, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

type Step = 'email' | 'otp' | 'password' | 'login';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setLoading(false);
      return;
    }
    toast({ title: 'Code sent', description: `Check ${email} for your 4-digit code.` });
    setStep('otp');
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Invalid code', description: error.message });
      setLoading(false);
      return;
    }
    setStep('password');
    setLoading(false);
  };

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password,
      data: { username: username || email.split('@')[0] },
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setLoading(false);
      return;
    }
    if (data.user) {
      login(mapSupabaseUser(data.user));
      toast({ title: 'Welcome!', description: 'Account created successfully.' });
      navigate('/');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: 'destructive', title: 'Login failed', description: error.message });
      setLoading(false);
      return;
    }
    if (data.user) {
      login(mapSupabaseUser(data.user));
      navigate('/');
    }
  };

  const switchMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    setStep(mode === 'signup' ? 'login' : 'email');
    setOtp('');
    setPassword('');
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-primary)] mb-4">
            <Sun className="size-7 text-white" />
          </div>
          <h1 className="font-display text-xl font-bold text-[var(--text-default)]">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 text-center">
            {mode === 'signup'
              ? 'Unlock unlimited calculations for £1.75/month'
              : 'Sign in to your OctoFlow account'}
          </p>
        </div>

        {/* Sign Up Flow */}
        {mode === 'signup' && step === 'email' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
                <Mail className="size-3.5" /> Email
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
                <User className="size-3.5" /> Username (optional)
              </Label>
              <Input
                type="text"
                placeholder="your_name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[var(--bg-surface)] border-[var(--border-default)]"
              />
            </div>
            <Button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="w-full gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Send Verification Code
            </Button>
          </div>
        )}

        {mode === 'signup' && step === 'otp' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-3 py-2.5 text-center">
              <p className="text-xs text-[var(--text-subtle)]">
                Enter the 4-digit code sent to <span className="font-semibold text-[var(--color-primary)]">{email}</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
                <ShieldCheck className="size-3.5" /> Verification Code
              </Label>
              <Input
                type="text"
                maxLength={4}
                placeholder="0000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="bg-[var(--bg-surface)] border-[var(--border-default)] text-center text-2xl font-mono tracking-[0.5em]"
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              />
            </div>
            <Button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Verify Code
            </Button>
            <button onClick={() => setStep('email')} className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--color-primary)]">
              Use a different email
            </button>
          </div>
        )}

        {mode === 'signup' && step === 'password' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--color-accent-green)]/20 bg-[var(--color-accent-green)]/5 px-3 py-2.5 text-center">
              <p className="text-xs font-medium text-[var(--color-accent-green)]">
                Email verified! Now set your password.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
                <KeyRound className="size-3.5" /> Password
              </Label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                onKeyDown={(e) => e.key === 'Enter' && handleSetPassword()}
              />
            </div>
            <Button
              onClick={handleSetPassword}
              disabled={loading || password.length < 6}
              className="w-full gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Create Account
            </Button>
          </div>
        )}

        {/* Login Flow */}
        {mode === 'login' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
                <Mail className="size-3.5" /> Email
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--bg-surface)] border-[var(--border-default)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
                <KeyRound className="size-3.5" /> Password
              </Label>
              <Input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[var(--bg-surface)] border-[var(--border-default)]"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Sign In
            </Button>
          </div>
        )}

        <div className="mt-6 border-t border-[var(--border-default)] pt-4 text-center">
          <button onClick={switchMode} className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">
            {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {mode === 'signup' && step === 'email' && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="size-1 rounded-full bg-[var(--color-accent-green)]" />
              Unlimited payback calculations
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="size-1 rounded-full bg-[var(--color-accent-green)]" />
              Save and compare configurations
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="size-1 rounded-full bg-[var(--color-accent-green)]" />
              Full EcoFlow product catalogue access
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="size-1 rounded-full bg-[var(--color-emphasis)]" />
              Only <span className="font-bold text-[var(--color-emphasis)]">£1.75/month</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
