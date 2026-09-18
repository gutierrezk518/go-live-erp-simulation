import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold'

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'md' | 'lg' | 'xl'; children: ReactNode }) {
  const base =
    'display inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold tracking-wide transition-all select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-cherry/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
  const sizes = { md: 'px-5 py-2.5 text-[18px]', lg: 'px-7 py-3.5 text-[22px]', xl: 'px-10 py-5 text-[28px]' }[size]
  const variants: Record<Variant, string> = {
    primary: 'bg-cherry text-white hover:bg-cherry-deep shadow-brand enabled:active:translate-y-px',
    secondary: 'bg-white text-ink border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    gold: 'bg-gold text-ink hover:bg-[#E6B800] shadow-md enabled:active:translate-y-px',
  }
  return (
    <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function Chip({ children, tone = 'cherry' }: { children: ReactNode; tone?: 'cherry' | 'gold' | 'steel' | 'gray' }) {
  const tones = {
    cherry: 'bg-cherry text-white',
    gold: 'bg-gold text-ink',
    steel: 'bg-steel text-white',
    gray: 'bg-slate-200 text-slate-800',
  }[tone]
  return <span className={`display caps inline-block rounded-md px-3 py-1 text-[15px] font-bold ${tones}`}>{children}</span>
}

/**
 * Steps back one screen. Deliberately understated and parked in the top bar, far from the
 * large forward buttons, so it reads as a correction rather than part of the flow.
 */
export function BackButton({ onClick, target }: { onClick: () => void; target: string | null }) {
  if (!target) return null
  return (
    <button
      onClick={onClick}
      title={`Go back to ${target}`}
      aria-label={`Go back to ${target}`}
      className="display flex shrink-0 items-center gap-1.5 rounded-lg border border-white/45 bg-white/10 px-3 py-1.5 text-[16px] font-bold text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  )
}

/** Cherry band across the top of every screen. */
export function TopBar({ left, right, back }: { left: ReactNode; right?: ReactNode; back?: ReactNode }) {
  return (
    <header className="flex items-center justify-between bg-cherry px-8 py-3 text-white shadow-md">
      <div className="flex items-center gap-4">
        {back}
        <div className="display text-[22px] font-black leading-none tracking-tight">
          GO-LIVE <span className="font-normal text-cherry-100">/ ERP Investment Simulation</span>
        </div>
        {left}
      </div>
      <div className="flex items-center gap-3">
        {right}
        <span className="display caps text-[13px] font-semibold text-cherry-100">Fox School of Business · MIS 2101</span>
      </div>
    </header>
  )
}

/** Readiness word, styled by band. Never shows a number. */
export function ReadinessPill({ label, large = false }: { label: string; large?: boolean }) {
  const tone: Record<string, string> = {
    'Rock Solid': 'bg-green-50 text-green border-green',
    Solid: 'bg-green-50 text-green border-green/60',
    Steady: 'bg-steel-50 text-steel border-steel/50',
    Shaky: 'bg-gold-50 text-gold-700 border-gold-700/60',
    Fragile: 'bg-danger-soft text-danger border-danger/60',
  }
  return (
    <span
      className={`display inline-block rounded-md border px-2.5 py-0.5 font-bold ${large ? 'text-[20px]' : 'text-[15px]'} ${tone[label] ?? 'bg-slate-100 text-slate-700 border-slate-300'}`}
    >
      {label}
    </span>
  )
}
