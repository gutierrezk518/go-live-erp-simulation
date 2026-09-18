import { ROUNDS } from '../config/rounds'
import { ValueChart } from '../components/ValueChart'
import { Button, Chip, ReadinessPill, TopBar } from '../components/ui'
import { markerPath, seriesStyle } from '../components/series'
import { readinessLabel, totalsThrough } from '../engine/scoring'
import type { Action, Session } from '../engine/session'

interface Props {
  s: Session
  dispatch: (a: Action) => void
}

export function RevealScreen({ s, dispatch }: Props) {
  const round = ROUNDS.find((r) => r.number === s.round)!
  const isLast = s.round === 4
  const satOut = s.groups.filter((g) => !s.choices[g.id]?.[s.round])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar left={<Chip tone="gold">Round {s.round} · What happened</Chip>} />

      <div className="grid flex-1 grid-cols-[1fr_1.15fr] gap-6 overflow-hidden px-8 py-5">
        {/* Consequences */}
        <section className="flex min-h-0 flex-col">
          <div className="display caps text-[15px] font-bold text-cherry">{round.title}</div>
          <h1 className="display text-[34px] font-black leading-tight tracking-tight text-ink">{round.prompt}</h1>
          {satOut.length > 0 && (
            <div className="display mt-1 text-[16px] font-bold text-gold-700">
              Did not decide in time: {satOut.map((g) => g.name).join(', ')}. No spend, no progress this round.
            </div>
          )}
          <div className="mt-3 grid min-h-0 flex-1 grid-rows-4 gap-2.5">
            {round.options.map((o) => {
              const takers = s.groups
                .map((g, i) => ({ g, i }))
                .filter(({ g }) => s.choices[g.id]?.[s.round] === o.id)
              return (
                <div
                  key={o.id}
                  className={`flex min-h-0 gap-4 rounded-xl border-2 bg-white p-3.5 shadow-sm ${takers.length ? 'border-slate-300' : 'border-slate-200 opacity-55'}`}
                >
                  <span className="display grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ink text-[24px] font-black text-white">
                    {o.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="display text-[21px] font-bold leading-tight text-ink">{o.label}</span>
                      {takers.map(({ g, i }) => {
                        const st = seriesStyle(i)
                        return (
                          <span key={g.id} className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[15px] font-semibold text-slate-800">
                            <svg width="14" height="14" viewBox="-8 -8 16 16" aria-hidden>
                              <path d={markerPath(st.shape, 5.5)} fill={st.color} />
                            </svg>
                            {g.name}
                          </span>
                        )
                      })}
                      {takers.length === 0 && <span className="text-[15px] text-slate-500">No group chose this</span>}
                    </div>
                    <p className="mt-1 text-[16px] leading-snug text-slate-700">{o.consequence}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Chart + readiness */}
        <section className="flex min-h-0 flex-col">
          <div className="flex items-baseline justify-between">
            <h2 className="display text-[26px] font-bold text-ink">Money out, value in</h2>
            <span className="text-[15px] text-slate-500">The line drops as you spend and rises as the system earns</span>
          </div>
          <div className="min-h-0 flex-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <ValueChart groups={s.groups} choices={s.choices} throughRound={s.round} realized={false} />
          </div>

          {!isLast && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <div className="display caps mb-1.5 text-[13px] font-bold text-slate-600">Implementation readiness so far</div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {s.groups.map((g) => (
                  <span key={g.id} className="inline-flex items-center gap-2 text-[16px] font-semibold text-ink">
                    {g.name}
                    <ReadinessPill label={readinessLabel(totalsThrough(s.choices[g.id] ?? {}, s.round).readiness)} />
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex justify-end">
            {isLast ? (
              <Button size="xl" onClick={() => dispatch({ type: 'SHOW_FINAL' })}>
                Show Final Results
              </Button>
            ) : (
              <Button size="xl" onClick={() => dispatch({ type: 'NEXT_ROUND' })}>
                Next: Round {s.round + 1}
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
