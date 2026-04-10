import { Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-primary)]">
                <Sun className="size-4 text-white" />
              </div>
              <span className="font-display text-base font-bold text-[var(--text-default)]">
                Octo<span className="text-[var(--color-emphasis)]">Flow</span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              Calculate your payback period for EcoFlow solar &amp; battery systems on Octopus Energy tariffs.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-default)] mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/calculator" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Payback Calculator</Link>
              <Link to="/products" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Browse EcoFlow Products</Link>
              <Link to="/saved" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Saved Calculations</Link>
              <Link to="/roadmap" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Roadmap</Link>
              <Link to="/pricing" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-default)] mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/terms" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">Cookie Information</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-default)] mb-3">Disclaimer</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Calculations are estimates based on simulated Octopus Agile rates and typical UK solar irradiance. Actual savings depend on weather, usage patterns, and real-time tariff rates. Not financial advice.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} OctoFlow. EcoFlow and Octopus Energy are registered trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
