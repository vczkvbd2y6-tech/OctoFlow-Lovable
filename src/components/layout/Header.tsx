import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, Menu, X, Zap, User, Crown, LogOut, FolderOpen, Activity, GitCompare, Infinity, ChevronDown, Calculator, BarChart3, TrendingUp, BookOpen, Bell, Calendar, Clock, Target, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/purple-glow.css';

// Navigation structure
const NAVIGATION = [
  {
    label: 'Home',
    path: '/',
    hasDropdown: false,
  },
  {
    label: 'Calculate',
    hasDropdown: true,
    items: [
      { label: 'Payback Calculator', path: '/payback-calculator', icon: Calculator },
      { label: 'Tariff Comparison', path: '/tariff-compare', icon: BarChart3 },
      { label: 'Balcony Solar', path: '/balcony-solar', icon: Sun },
    ],
  },
  {
    label: 'Monitor',
    hasDropdown: true,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
      { label: 'Connect', path: '/connect', icon: Zap },
      { label: 'History', path: '/history', icon: Calendar },
    ],
  },
  {
    label: 'Optimise',
    hasDropdown: true,
    items: [
      { label: 'Recommendations', path: '/recommendations', icon: Target },
      { label: 'Load Shift Planner', path: '/load-shift-planner', icon: Clock },
      { label: 'Alerts', path: '/alerts', icon: Bell, proOnly: true },
    ],
  },
  {
    label: 'Learn',
    hasDropdown: true,
    items: [
      { label: 'Smart Tariffs Guide', path: '/learn/smart-tariffs', icon: TrendingUp },
      { label: 'Balcony Solar UK Guide', path: '/learn/balcony-solar', icon: Sun },
      { label: 'Glossary', path: '/learn/glossary', icon: BookOpen },
      { label: 'Recent Blog Posts', path: '/blog', icon: Lightbulb },
    ],
  },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { user, isSubscribed, subscriptionTier, loading, logout } = useAuth();

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('octoflow-theme') as 'light' | 'dark' | null;
    setThemeMode(storedTheme ?? 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const cycleTheme = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    window.localStorage.setItem('octoflow-theme', nextTheme);
  };

  const themeIcon = themeMode === 'light' ? <Sun className="size-4" /> : <Moon className="size-4" />;
  const themeLabel = themeMode === 'light' ? 'Light mode' : 'Dark mode';

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-header border-b border-[var(--border-default)] bg-[var(--bg-overlay)] backdrop-blur-xl relative">
      {/* Pulsating purple glow at bottom of nav bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 purple-glow" />
      
      <div className="grid grid-cols-[auto_1fr_auto] h-16 items-center px-4 lg:px-8 gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-primary)]">
            <Sun className="size-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-[var(--text-default)]">
            Octo<span className="text-[var(--color-emphasis)]">Flow</span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-1 md:flex">
          {NAVIGATION.map((item) => {
            const isActive = item.hasDropdown
              ? item.items?.some(subItem => location.pathname === subItem.path)
              : location.pathname === item.path;

            if (item.hasDropdown) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'text-[var(--text-subtle)] hover:text-[var(--text-default)] hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="size-3.5" />
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[var(--color-primary)]" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-[var(--bg-elevated)] border-[var(--border-default)]">
                    {item.items?.map((subItem, index) => (
                      <div key={subItem.path}>
                        <DropdownMenuItem asChild>
                          <Link
                            to={subItem.path}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-default)] hover:bg-[var(--bg-surface)] cursor-pointer"
                          >
                            <subItem.icon className="size-4 text-[var(--color-primary)]" />
                            <div className="flex-1">
                              <span>{subItem.label}</span>
                              {subItem.proOnly && (
                                <span className="ml-2 text-xs text-[var(--color-emphasis)] bg-[var(--color-emphasis)]/10 px-1.5 py-0.5 rounded">
                                  Pro
                                </span>
                              )}
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        {index < item.items.length - 1 && <DropdownMenuSeparator className="bg-[var(--border-default)]" />}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'text-[var(--text-subtle)] hover:text-[var(--text-default)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[var(--color-primary)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              to="/blog"
              className="text-sm font-medium text-[var(--text-subtle)] hover:text-[var(--text-default)] transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/help"
              className="text-sm font-medium text-[var(--text-subtle)] hover:text-[var(--text-default)] transition-colors"
            >
              Help
            </Link>
          </nav>
          <Button
            size="sm"
            variant="outline"
            className="hidden sm:inline-flex gap-1.5 border-[var(--border-default)] text-[var(--text-subtle)] hover:text-[var(--color-primary)]"
            onClick={cycleTheme}
            title={`Switch theme (${themeLabel})`}
          >
            {themeIcon}
          </Button>

          {/* Authentication Button - Show Sign In by default, Avatar when logged in */}
          {!user ? (
            <Link to="/auth">
              <Button size="sm" variant="outline" className="hidden sm:flex gap-1.5 border-[var(--border-default)] text-[var(--text-subtle)] hover:text-[var(--color-primary)]">
                <User className="size-3.5" />
                Sign In/Sign Up
              </Button>
            </Link>
          ) : (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-primary)]">
                  <User className="size-3.5 text-white" />
                </div>
                {isSubscribed && (
                  subscriptionTier === 'pro_lifetime'
                    ? <Infinity className="size-3.5 text-[var(--color-emphasis)]" />
                    : <Crown className="size-3.5 text-[var(--color-emphasis)]" />
                )}
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-lg z-50">
                  <Link
                    to="/account"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-default)] hover:bg-[var(--bg-surface)] border-b border-[var(--border-default)] first:rounded-t-lg"
                  >
                    <User className="size-4" />
                    My Account
                  </Link>
                  <Link
                    to="/saved"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-default)] hover:bg-[var(--bg-surface)]"
                  >
                    <FolderOpen className="size-4" />
                    Saved Systems
                  </Link>
                  <Link
                    to="/my-system"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-default)] hover:bg-[var(--bg-surface)]"
                  >
                    <Activity className="size-4" />
                    My System
                  </Link>
                  <Link
                    to="/compare"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-default)] hover:bg-[var(--bg-surface)] border-b border-[var(--border-default)]"
                  >
                    <GitCompare className="size-4" />
                    Compare Systems
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-subtle)] hover:text-[var(--text-default)] hover:bg-[var(--bg-surface)] last:rounded-b-lg"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
          <Link to="/payback-calculator">
            <Button size="sm" className="hidden sm:flex gap-1.5 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold">
              <Zap className="size-3.5" />
              Calculate Now
            </Button>
          </Link>
          <button
            className="flex md:hidden size-10 items-center justify-center rounded-lg text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAVIGATION.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div key={item.label}>
                    <div className="px-4 py-3 text-sm font-semibold text-[var(--text-default)] border-b border-[var(--border-default)]">
                      {item.label}
                    </div>
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-6 py-3 rounded-lg text-sm text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]"
                      >
                        <subItem.icon className="size-4 text-[var(--color-primary)]" />
                        <span>{subItem.label}</span>
                        {subItem.proOnly && (
                          <span className="ml-auto text-xs text-[var(--color-emphasis)] bg-[var(--color-emphasis)]/10 px-1.5 py-0.5 rounded">
                            Pro
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-[var(--border-default)] my-2" />
            <Link
              to="/blog"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]"
            >
              Blog
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]"
            >
              Help
            </Link>
            {!loading && user && (
              <>
                <div className="border-t border-[var(--border-default)] my-2" />
                <p className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">My Account</p>
                <Link
                  to="/saved"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]"
                >
                  <FolderOpen className="size-4" />
                  Saved Systems
                </Link>
                <Link
                  to="/my-system"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]"
                >
                  <Activity className="size-4" />
                  My System
                </Link>
                <Link
                  to="/compare"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]"
                >
                  <GitCompare className="size-4" />
                  Compare Systems
                </Link>
              </>
            )}
          </div>
          <button
            onClick={cycleTheme}
            className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]"
          >
            {themeIcon}
            <span>Theme: {themeMode}</span>
          </button>
          {!loading && !user && (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white"
            >
              <User className="size-4" /> Sign In / Create Account
            </Link>
          )}
          {!loading && user && (
            <Link
              to="/account"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-3 rounded-lg bg-[var(--bg-surface)] px-4 py-3"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-primary)]">
                <User className="size-3.5 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-[var(--text-default)]">{user.username}</p>
                <p className="text-xs text-[var(--text-muted)]">{isSubscribed ? (subscriptionTier === 'pro_lifetime' ? 'Lifetime Pro' : 'Pro') : 'Free Plan'}</p>
              </div>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
