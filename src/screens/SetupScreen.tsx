import { useState } from 'react'
import { Button, TopBar } from '../components/ui'
import type { Session } from '../engine/session'

interface Props {
  saved: Session | null
  onStart: (names: string[]) => void
  onResume: () => void
}

export function SetupScreen({ saved, onStart, onResume }: Props) {
  const [count, setCount] = useState(8)
  const [names, setNames] = useState<string[]>(Array.from({ length: 10 }, (_, i) => `Group ${i + 1}`))

  const canResume = saved && saved.groups.length > 0 && saved.phase !== 'setup'
  const resumeLabel = saved
    ? saved.phase === 'final'
      ? 'final results'
      : saved.phase === 'brief'
        ? 'the case briefing'
        : `Round ${saved.round} (${saved.phase === 'reveal' ? 'reveal' : 'deciding'})`
    : ''

  return (
    <div className="flex h-screen flex-col">
      <TopBar left={null} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-8">
        <div className="grid grid-cols-[1.1fr_1fr] gap-12">
          <section>
            <div className="display caps text-[15px] font-bold text-cherry">Week 4 · Enterprise Resource Planning</div>
            <h1 className="display mt-2 text-[64px] font-black leading-[1.02] tracking-tight text-ink">
              Go-Live
            </h1>
            <p className="mt-3 text-[22px] leading-snug text-slate-700">
              Eight steering committees. One restaurant equipment manufacturer. $15 million each. Four decisions that
              determine whether a new ERP system pays off or blows up.
            </p>
            <ul className="mt-6 space-y-2 text-[17px] text-slate-700">
              <li>1. Each group sends a representative to the laptop to lock in a choice.</li>
              <li>2. After every round, the chart updates. Spending pushes each line down.</li>
              <li>3. After Round 4, the projections become real, and the class sees who actually got a return.</li>
            </ul>
            {canResume && (
              <div className="mt-8 rounded-xl border-2 border-gold bg-gold-50 p-5">
                <div className="display text-[20px] font-bold text-ink">A previous session is saved on this laptop</div>
                <div className="mt-1 text-[16px] text-slate-700">
                  {saved!.groups.length} groups, currently at {resumeLabel}.
                </div>
                <Button variant="gold" size="md" className="mt-3" onClick={onResume}>
                  Resume previous session
                </Button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md">
            <h2 className="display text-[28px] font-bold text-ink">Session setup</h2>
            <label className="mt-5 block">
              <span className="display caps text-[14px] font-bold text-slate-600">Number of groups (4–10)</span>
              <input
                type="number"
                min={4}
                max={10}
                value={count}
                onChange={(e) => setCount(Math.max(4, Math.min(10, Number(e.target.value) || 4)))}
                className="mt-1 w-28 rounded-lg border-2 border-slate-300 px-3 py-2 text-[22px] font-bold focus:border-cherry focus:outline-none"
              />
            </label>
            <div className="mt-5">
              <span className="display caps text-[14px] font-bold text-slate-600">Group names (optional)</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {names.slice(0, count).map((n, i) => (
                  <input
                    key={i}
                    value={n}
                    onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))}
                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-[16px] focus:border-cherry focus:outline-none"
                  />
                ))}
              </div>
            </div>
            <Button size="lg" className="mt-7 w-full" onClick={() => onStart(names.slice(0, count))}>
              Start Session
            </Button>
            <p className="mt-3 text-[13px] text-slate-500">
              Everything is saved in this browser automatically. If the page reloads, choose Resume.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
