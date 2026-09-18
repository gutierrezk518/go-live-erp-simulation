import { useState } from 'react'
import { BENCHMARK } from '../config/rounds'
import { ValueChart } from '../components/ValueChart'
import { BackButton, Button, Chip, ReadinessPill, TopBar } from '../components/ui'
import { markerPath, seriesStyle } from '../components/series'
import { finalResult, fmtM, fmtPct } from '../engine/scoring'
import { backTarget, type Action, type Session } from '../engine/session'

interface Props {
  s: Session
  dispatch: (a: Action) => void
  onExport: () => void
  onNewSession: () => void
}

export function FinalScreen({ s, dispatch, onExport, onNewSession }: Props) {
  const [debriefOpen, setDebriefOpen] = useState(false)
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const results = s.groups
    .map((g, i) => ({ g, i, r: finalResult(s.choices[g.id] ?? {}) }))
    .sort((a, b) => b.r.roi - a.r.roi)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        back={<BackButton onClick={() => dispatch({ type: 'STEP_BACK' })} target={backTarget(s)} />}
        left={<Chip tone="gold">{s.realized ? 'Final results' : 'Round 4 complete'}</Chip>}
        right={
          <>
            <Button variant="ghost" size="md" className="text-white hover:bg-cherry-deep" onClick={onExport}>
              Export session JSON
            </Button>
            <Button variant="ghost" size="md" className="text-white hover:bg-cherry-deep" onClick={onNewSession}>
              New session
            </Button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col px-8 py-4">
        {/* Headline + controls */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="display text-[40px] font-black leading-none tracking-tight text-ink">
              {s.realized ? 'What the investment actually returned' : 'Everyone is underwater. That is what buying an ERP looks like.'}
            </h1>
            <p className="mt-1.5 text-[18px] text-slate-700">
              {s.realized
                ? 'Value only counts if the organization is ready to capture it. Readiness set each group’s realization multiplier.'
                : 'Four rounds of spending, and every line is below the break-even mark. Now we find out what that money actually bought.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {!s.realized ? (
              <Button size="xl" variant="gold" onClick={() => dispatch({ type: 'APPLY_MULTIPLIER' })}>
                Apply Readiness Multiplier
              </Button>
            ) : (
              <>
                <div className="flex rounded-lg border-2 border-slate-300 p-0.5">
                  <button
                    onClick={() => setView('chart')}
                    className={`display rounded-md px-3 py-1.5 text-[16px] font-bold ${view === 'chart' ? 'bg-ink text-white' : 'text-slate-700'}`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => setView('table')}
                    className={`display rounded-md px-3 py-1.5 text-[16px] font-bold ${view === 'table' ? 'bg-ink text-white' : 'text-slate-700'}`}
                  >
                    Results table
                  </button>
                </div>
                {view === 'chart' && (
                  <Button variant={s.showBenchmark ? 'secondary' : 'primary'} size="md" onClick={() => dispatch({ type: 'TOGGLE_BENCHMARK' })}>
                    {s.showBenchmark ? 'Hide Revlon benchmark' : 'Show Revlon 2018 benchmark'}
                  </Button>
                )}
                <Button variant="secondary" size="md" onClick={() => setDebriefOpen((v) => !v)}>
                  {debriefOpen ? 'Close debrief' : 'Debrief'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="mt-3 grid min-h-0 flex-1 gap-5" style={{ gridTemplateColumns: debriefOpen ? '1fr 400px' : '1fr' }}>
          <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {view === 'chart' ? (
              <div className="h-full p-2">
                <ValueChart
                  groups={s.groups}
                  choices={s.choices}
                  throughRound={4}
                  realized={s.realized}
                  headroomForRealized
                  showBenchmark={s.showBenchmark}
                />
              </div>
            ) : (
              <div className="h-full overflow-auto p-2">
                <table className="w-full border-collapse text-[18px]">
                  <thead>
                    <tr className="display caps text-left text-[13px] font-bold text-slate-600">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Group</th>
                      <th className="px-3 py-2">Choices</th>
                      <th className="px-3 py-2 text-right">Total spend</th>
                      <th className="px-3 py-2 text-right">Over budget</th>
                      <th className="px-3 py-2">Readiness</th>
                      <th className="px-3 py-2 text-right">Multiplier</th>
                      <th className="px-3 py-2 text-right">Realized 5-yr value</th>
                      <th className="px-3 py-2 text-right">Disruption</th>
                      <th className="px-3 py-2 text-right">Net result</th>
                      <th className="px-3 py-2 text-right">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="tabular">
                    {results.map(({ g, i, r }, rank) => {
                      const st = seriesStyle(i)
                      const c = s.choices[g.id] ?? {}
                      return (
                        <tr key={g.id} className="border-t border-slate-200">
                          <td className="display whitespace-nowrap px-3 py-2.5 text-[20px] font-black text-slate-500">{rank + 1}</td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <span className="inline-flex items-center gap-2 display text-[20px] font-bold text-ink">
                              <svg width="18" height="18" viewBox="-9 -9 18 18" aria-hidden>
                                <path d={markerPath(st.shape, 6.5)} fill={st.color} />
                              </svg>
                              {g.name}
                            </span>
                          </td>
                          <td className="display whitespace-nowrap px-3 py-2.5 text-[17px] font-semibold tracking-widest text-slate-700">
                            {[1, 2, 3, 4].map((n) => c[n as 1 | 2 | 3 | 4] ?? '–').join(' ')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right">{fmtM(r.spend)}</td>
                          <td className={`whitespace-nowrap px-3 py-2.5 text-right ${r.overrun > 0 ? 'font-semibold text-gold-700' : 'text-slate-500'}`}>
                            {r.overrun > 0 ? `${fmtM(r.overrun)} (+${fmtM(r.overrunPremium)} premium)` : `${fmtM(r.unspent)} unspent`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <span className="inline-flex items-center gap-2">
                              <ReadinessPill label={r.readinessLabel} />
                              <span className="text-[15px] text-slate-500">({r.readiness > 0 ? '+' : ''}{r.readiness})</span>
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">{r.multiplier.toFixed(1)}×</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right">{fmtM(r.realizedValue)}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right text-danger">{r.disruption ? `−${fmtM(r.disruption)}` : '—'}</td>
                          <td className={`whitespace-nowrap px-3 py-2.5 text-right font-bold ${r.net < 0 ? 'text-danger' : 'text-ink'}`}>{fmtM(r.net, { sign: true })}</td>
                          <td className={`display px-3 py-2.5 text-right text-[22px] font-black ${r.roi < 0 ? 'text-danger' : 'text-green'}`}>
                            {fmtPct(r.roi)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p className="px-3 pt-3 text-[14px] text-slate-500">
                  Realized 5-yr value = annual value × 5 × multiplier. Net result = realized value − total spend − overrun premium − disruption.
                  ROI = net result ÷ (total spend + overrun premium). Unspent budget is kept, not multiplied. {BENCHMARK.label}: {BENCHMARK.detail}
                </p>
              </div>
            )}
          </div>

          {debriefOpen && (
            <aside className="min-h-0 overflow-y-auto rounded-xl border-2 border-cherry-100 bg-white p-5 shadow-sm">
              <div className="display caps text-[13px] font-bold text-cherry">Instructor debrief</div>

              <h3 className="display mt-2 text-[22px] font-bold text-ink">1. The pattern</h3>
              <p className="mt-1 text-[16px] leading-snug text-slate-800">
                Every high-ROI group funded data cleanup and training. Every low-ROI group bought software and skipped the people.
                Same platform, same company, same budget. The difference was what the money bought.
              </p>

              <h3 className="display mt-4 text-[22px] font-bold text-ink">2. The counterfactual</h3>
              <p className="mt-1 text-[16px] leading-snug text-slate-800">
                <strong>Revlon, 2018.</strong> SAP S/4HANA go-live at the Oxford, NC plant. $64M in lost sales. $53M in remediation. A 7% stock drop.
                Four shareholder class actions. Revlon disclosed every one of these risks in its 2017 10-K before it happened.
              </p>

              <h3 className="display mt-4 text-[22px] font-bold text-ink">3. Debrief questions</h3>
              <ol className="mt-1 list-decimal space-y-2 pl-5 text-[16px] leading-snug text-slate-800">
                <li>Which round’s decision mattered most, and when did you find that out?</li>
                <li>The cheapest path spent $6.2M and lost money. What exactly did that money fail to buy?</li>
                <li>Revlon wrote down every risk that hurt them. Why didn’t writing it down help?</li>
              </ol>

              <div className="mt-5 rounded-lg bg-slate-50 p-3 text-[14px] text-slate-600">
                Ranking as played: {results.map(({ g, r }) => `${g.name} ${fmtPct(r.roi)}`).join(' · ')}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
