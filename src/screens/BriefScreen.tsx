import { SCENARIO } from '../config/scenario'
import { Button, Chip, TopBar } from '../components/ui'

interface Props {
  groupCount: number
  /** True when reopened mid-session from the round screen. */
  returning: boolean
  onBegin: () => void
}

/** The case, on the front of the room, before Round 1. Also reachable mid-session via "The Case". */
export function BriefScreen({ groupCount, returning, onBegin }: Props) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar left={<Chip tone="gold">The Case</Chip>} />
      <main className="grid flex-1 grid-cols-[1.25fr_1fr] gap-8 overflow-hidden px-10 py-6">
        {/* Left: the company */}
        <section className="flex flex-col">
          <div className="display caps text-[15px] font-bold text-cherry">{SCENARIO.tagline}</div>
          <h1 className="display text-[58px] font-black leading-none tracking-tight text-ink">{SCENARIO.company}</h1>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {SCENARIO.facts.map((f) => (
              <div key={f.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="display caps text-[12px] font-bold text-slate-500">{f.label}</div>
                <div className="display tabular text-[28px] font-black leading-tight text-ink">{f.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="display caps text-[14px] font-bold text-slate-600">The situation</div>
            <ul className="mt-1 space-y-1.5 text-[19px] leading-snug text-slate-800">
              {SCENARIO.situation.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-cherry" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <div className="display caps text-[14px] font-bold text-slate-600">What hurts today</div>
            <ul className="mt-1 space-y-1.5 text-[19px] leading-snug text-slate-800">
              {SCENARIO.pain.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto rounded-xl bg-cherry px-6 py-4 text-white shadow-brand">
            <div className="display text-[26px] font-bold leading-tight">{SCENARIO.role}</div>
            <div className="display mt-1 text-[32px] font-black leading-tight text-gold">{SCENARIO.budget}</div>
          </div>
        </section>

        {/* Right: the decisions and the scoring */}
        <section className="flex flex-col">
          <div className="display caps text-[14px] font-bold text-slate-600">Your four decisions</div>
          <ol className="mt-2 space-y-2">
            {SCENARIO.decisions.map((d) => (
              <li key={d.round} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <span className="display grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ink text-[24px] font-black text-white">
                  {d.round}
                </span>
                <div>
                  <div className="display text-[22px] font-bold leading-tight text-ink">{d.title}</div>
                  <div className="text-[16px] text-slate-700">{d.blurb}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 display caps text-[14px] font-bold text-slate-600">How you are scored</div>
          <ul className="mt-1 space-y-1 text-[17px] leading-snug text-slate-800">
            {SCENARIO.howScored.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-[8px] h-2 w-2 shrink-0 rounded-full bg-steel" />
                <span>{s}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg border-2 border-gold bg-gold-50 px-4 py-3 text-[18px] font-semibold text-ink">
            <div>{SCENARIO.overrun}</div>
            <div className="mt-1 text-[16px] font-normal text-slate-700">{SCENARIO.reminder}</div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-[15px] text-slate-500">{groupCount} steering committees ready</span>
            <Button size="xl" onClick={onBegin}>
              {returning ? 'Back to the round' : 'Begin Round 1'}
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
