import { Link } from 'react-router-dom';
import { Zap, ArrowRight, TrendingUp, Shield, Package, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {/* Complex Animated Purple Light Waves Background */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="blurEffect">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
            <filter id="softGlow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.8" />
              </feComponentTransfer>
            </filter>
            <style>{`
              @keyframes wavePrimary {
                0% { d: path('M0,280 Q150,240 300,260 T600,280 T900,260 T1200,280 L1200,600 L0,600 Z'); }
                25% { d: path('M0,260 Q150,220 300,240 T600,260 T900,240 T1200,260 L1200,600 L0,600 Z'); }
                50% { d: path('M0,300 Q150,280 300,300 T600,320 T900,300 T1200,300 L1200,600 L0,600 Z'); }
                75% { d: path('M0,280 Q150,260 300,280 T600,300 T900,280 T1200,280 L1200,600 L0,600 Z'); }
                100% { d: path('M0,280 Q150,240 300,260 T600,280 T900,260 T1200,280 L1200,600 L0,600 Z'); }
              }
              
              @keyframes waveSecondary {
                0% { d: path('M0,340 Q200,300 400,330 T800,340 T1200,330 L1200,600 L0,600 Z'); }
                25% { d: path('M0,320 Q200,280 400,310 T800,320 T1200,310 L1200,600 L0,600 Z'); }
                50% { d: path('M0,360 Q200,340 400,360 T800,370 T1200,360 L1200,600 L0,600 Z'); }
                75% { d: path('M0,340 Q200,320 400,340 T800,350 T1200,340 L1200,600 L0,600 Z'); }
                100% { d: path('M0,340 Q200,300 400,330 T800,340 T1200,330 L1200,600 L0,600 Z'); }
              }
              
              @keyframes waveTertiary {
                0% { d: path('M0,390 Q250,360 500,385 T1000,390 T1200,385 L1200,600 L0,600 Z'); }
                25% { d: path('M0,370 Q250,340 500,365 T1000,370 T1200,365 L1200,600 L0,600 Z'); }
                50% { d: path('M0,410 Q250,390 500,410 T1000,420 T1200,410 L1200,600 L0,600 Z'); }
                75% { d: path('M0,390 Q250,370 500,390 T1000,400 T1200,390 L1200,600 L0,600 Z'); }
                100% { d: path('M0,390 Q250,360 500,385 T1000,390 T1200,385 L1200,600 L0,600 Z'); }
              }
              
              @keyframes waveQuaternary {
                0% { d: path('M0,450 Q200,420 400,445 T800,450 T1200,445 L1200,600 L0,600 Z'); }
                25% { d: path('M0,430 Q200,400 400,425 T800,430 T1200,425 L1200,600 L0,600 Z'); }
                50% { d: path('M0,470 Q200,450 400,470 T800,480 T1200,470 L1200,600 L0,600 Z'); }
                75% { d: path('M0,450 Q200,430 400,450 T800,460 T1200,450 L1200,600 L0,600 Z'); }
                100% { d: path('M0,450 Q200,420 400,445 T800,450 T1200,445 L1200,600 L0,600 Z'); }
              }
              
              @keyframes orbFloat1 {
                0% { cx: 150; cy: 150; opacity: 0.4; }
                25% { cx: 250; cy: 120; opacity: 0.6; }
                50% { cx: 200; cy: 200; opacity: 0.4; }
                75% { cx: 100; cy: 180; opacity: 0.5; }
                100% { cx: 150; cy: 150; opacity: 0.4; }
              }
              
              @keyframes orbFloat2 {
                0% { cx: 900; cy: 200; opacity: 0.3; }
                25% { cx: 950; cy: 150; opacity: 0.5; }
                50% { cx: 1000; cy: 250; opacity: 0.3; }
                75% { cx: 900; cy: 280; opacity: 0.4; }
                100% { cx: 900; cy: 200; opacity: 0.3; }
              }
              
              @keyframes orbFloat3 {
                0% { cx: 600; cy: 100; opacity: 0.35; }
                25% { cx: 650; cy: 80; opacity: 0.55; }
                50% { cx: 550; cy: 150; opacity: 0.35; }
                75% { cx: 600; cy: 120; opacity: 0.45; }
                100% { cx: 600; cy: 100; opacity: 0.35; }
              }
              
              @keyframes orbPulse {
                0%, 100% { r: 45; filter: url(#softGlow); }
                50% { r: 60; filter: url(#softGlow); }
              }
              
              #wave1 { animation: wavePrimary 9s ease-in-out infinite; }
              #wave2 { animation: waveSecondary 7s ease-in-out infinite 1.2s; }
              #wave3 { animation: waveTertiary 8s ease-in-out infinite 0.6s; }
              #wave4 { animation: waveQuaternary 10s ease-in-out infinite 1.8s; }
              
              #orb1 { animation: orbFloat1 11s ease-in-out infinite, orbPulse 4s ease-in-out infinite; }
              #orb2 { animation: orbFloat2 13s ease-in-out infinite, orbPulse 5s ease-in-out infinite 0.5s; }
              #orb3 { animation: orbFloat3 12s ease-in-out infinite, orbPulse 4.5s ease-in-out infinite 1s; }
            `}</style>
          </defs>
          
          {/* Floating orbs background */}
          <circle id="orb1" r="45" fill="url(#orbGlow1)" opacity="0.4" />
          <circle id="orb2" r="35" fill="url(#orbGlow2)" opacity="0.3" />
          <circle id="orb3" r="50" fill="url(#orbGlow3)" opacity="0.35" />
          
          {/* Wave layers with complex gradients */}
          <path
            id="wave1"
            fill="url(#gradientPrimary)"
            opacity="0.35"
            d="M0,280 Q150,240 300,260 T600,280 T900,260 T1200,280 L1200,600 L0,600 Z"
          />
          
          <path
            id="wave2"
            fill="url(#gradientSecondary)"
            opacity="0.25"
            d="M0,340 Q200,300 400,330 T800,340 T1200,330 L1200,600 L0,600 Z"
          />
          
          <path
            id="wave3"
            fill="url(#gradientTertiary)"
            opacity="0.2"
            d="M0,390 Q250,360 500,385 T1000,390 T1200,385 L1200,600 L0,600 Z"
          />
          
          <path
            id="wave4"
            fill="url(#gradientQuaternary)"
            opacity="0.15"
            d="M0,450 Q200,420 400,445 T800,450 T1200,445 L1200,600 L0,600 Z"
          />
          
          <defs>
            {/* Radial gradients for floating orbs */}
            <radialGradient id="orbGlow1" cx="30%" cy="30%">
              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id="orbGlow2" cx="30%" cy="30%">
              <stop offset="0%" style={{ stopColor: '#d946ef', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id="orbGlow3" cx="30%" cy="30%">
              <stop offset="0%" style={{ stopColor: '#c084fc', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0 }} />
            </radialGradient>
            
            {/* Linear gradients for waves */}
            <linearGradient id="gradientPrimary" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.7 }} />
              <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0.1 }} />
            </linearGradient>
            <linearGradient id="gradientSecondary" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#d946ef', stopOpacity: 0.5 }} />
              <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#6d28d9', stopOpacity: 0.08 }} />
            </linearGradient>
            <linearGradient id="gradientTertiary" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#c084fc', stopOpacity: 0.4 }} />
              <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#5b21b6', stopOpacity: 0.05 }} />
            </linearGradient>
            <linearGradient id="gradientQuaternary" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.25 }} />
              <stop offset="100%" style={{ stopColor: '#6d28d9', stopOpacity: 0.02 }} />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)] via-[var(--bg-base)]/90 to-[var(--bg-base)]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:pt-20 sm:pb-24 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-transparent px-3 py-1.5 whitespace-nowrap">
                <Zap className="size-3.5 text-[var(--color-primary)] shrink-0" />
                <span className="text-xs font-medium text-[var(--color-primary)]">All Octopus Tariffs</span>
              </div>
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-transparent px-3 py-1.5 whitespace-nowrap">
                <Package className="size-3.5 text-[var(--color-primary)] shrink-0" />
                <span className="text-xs font-medium text-[var(--color-primary)]">All EcoFlow Products</span>
              </div>
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-transparent px-3 py-1.5 whitespace-nowrap">
                <Calculator className="size-3.5 text-[var(--color-primary)] shrink-0" />
                <span className="text-xs font-medium text-[var(--color-primary)]">Build System and Calculate Payback</span>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] text-[var(--text-default)] text-balance mb-5">
              Know exactly when your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)]">
                solar &amp; battery
              </span>{' '}
              pays for itself
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-subtle)] leading-relaxed text-pretty max-w-xl mb-8">
              Model your EcoFlow system against real Octopus Agile half-hourly rates.
              Compare configurations side-by-side and find the fastest route to energy payback.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/calculator">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold px-7">
                  Start Calculating
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/tariffs">
                <Button variant="outline" size="lg" className="gap-2 border-[var(--border-default)] text-[var(--text-subtle)] hover:bg-[var(--bg-surface)]">
                  Compare Tariffs
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/80 backdrop-blur-sm p-5 glow-border">
                <TrendingUp className="size-5 text-[var(--color-accent-green)] mb-3" />
                <p className="font-display text-2xl font-bold tabular-nums text-[var(--text-default)]">~£480</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Average annual savings with Agile + battery</p>
              </div>
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/80 backdrop-blur-sm p-5 glow-border">
                <Shield className="size-5 text-[var(--color-primary)] mb-3" />
                <p className="font-display text-2xl font-bold tabular-nums text-[var(--text-default)]">6–9yr</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Typical payback period for EcoFlow systems</p>
              </div>
              <div className="col-span-2 rounded-xl border border-[var(--color-emphasis)]/20 bg-[var(--color-emphasis)]/5 backdrop-blur-sm p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--color-emphasis)]/15">
                    <Zap className="size-5 text-[var(--color-emphasis)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-default)]">Agile rates go negative</p>
                    <p className="text-xs text-[var(--text-muted)]">Get paid to charge your battery — rates hit -8.4p in 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
