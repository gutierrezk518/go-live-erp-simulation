import { OVERRUN_RULE, ROUNDS } from '../config/rounds'
import { GroupTile } from '../components/GroupTile'
import { OptionCard } from '../components/OptionCard'
import { BackButton, Button, Chip, TopBar } from '../components/ui'
import { fmtM, overrunIfChosen, totalsThrough } from '../engine/scoring'
import { allLocked, backTarget, type Action, type Session } from '../engine/session'

interface Props {
  s: Session
  dispatch: (a: Action) => void
}

export function DecisionScreen({ s, dispatch }: Props) {
  const round = ROUNDS.find((r) => r.number === s.round)!
  const active = s.groups.find((g) => g.id === s.activeGroupId) ?? null
  const activeChoices = active ? (s.choices[active.id] ?? {}) : {}
  const activeTotals = active ? totalsThrough(activeChoices, s.round - 1) : null
  const lockedCount = s.groups.filter((g) => !!s.choices[g.id]?.[s.round]).length
  const ready = allLocked(s)
  const pendingOpt = s.pendingOption ? round.options.find((o) => o.id === s.pendingOption) : null
  const pendingOver = active && pendingOpt ? overrunIfChosen(activeChoices, s.round, pendingOpt) : null

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        back={<BackButton onClick={() => dispatch({ type: 'STEP_BACK' })} target={backTarget(s)} />}
        left={<Chip tone="gold">Round {s.round} of 4</Chip>}
        right={
          <Button variant="ghost" size="md" className="text-white hover:bg-cherry-deep" onClick={() => dispatch({ type: 'SHOW_BRIEF' })}>
            The Case
          </Button>
        }
      />

      <div className="grid flex-1 grid-cols-[1fr_340px] gap-6 overflow-hidden px-8 py-5">
        {/* Main column */}
        <div className="flex min-h-0 flex-col">
          <div>
            <div className="display caps text-[15px] font-bold text-cherry">
              Decision {s.round}: {round.title}
            </div>
            <h1 className="display mt-1 text-[44px] font-black leading-[1.05] tracking-tight text-ink">{round.prompt}</h1>
            {round.context && <p className="mt-1.5 text-[19px] leading-snug text-slate-700">{round.context}</p>}
          </div>

          <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-4">
            {round.options.map((o) => {
              const over = active ? overrunIfChosen(activeChoices, s.round, o) : null
              return (
                <OptionCard
                  key={o.id}
                  option={o}
                  enabled={!!active}
                  selected={s.pendingOption === o.id}
                  goesOver={!!over?.goesOver}
                  addedOverrun={over?.addedOverrun ?? 0}
                  addedPremium={over?.addedPremium ?? 0}
                  onPick={() => dispatch({ type: 'PICK_OPTION', option: o.id })}
                />
              )
            })}
          </div>

          {/* Action bar */}
          <div className="mt-4 flex min-h-[76px] items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-5 py-3 shadow-sm">
            {active && activeTotals ? (
              <>
                <div>
                  <div className="display text-[24px] font-bold text-ink">
                    {active.name} <span className="font-normal text-slate-500">is choosing</span>
                    <span className={`tabular ml-3 text-[18px] font-semibold ${activeTotals.remaining < 0 ? 'text-danger' : 'text-slate-600'}`}>
                      {activeTotals.remaining < 0 ? `${fmtM(-activeTotals.remaining)} over budget` : `${fmtM(activeTotals.remaining)} remaining`}
                    </span>
                  </div>
                  <div className="text-[16px] text-slate-600">
                    {pendingOpt
                      ? pendingOver?.goesOver
                        ? `Option ${pendingOpt.id} takes you ${fmtM(pendingOver.addedOverrun)} over budget. The board will fund it; the overrun premium adds ${fmtM(pendingOver.addedPremium)} to your cost. Confirm to lock it in.`
                        : `Option ${pendingOpt.id}: ${pendingOpt.label}. Confirm to lock it in.`
                      : `Pick one of the four options above. ${OVERRUN_RULE}`}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => dispatch({ type: 'CANCEL' })}>
                    Cancel
                  </Button>
                  <Button size="lg" variant={pendingOver?.goesOver ? 'gold' : 'primary'} disabled={!s.pendingOption} onClick={() => dispatch({ type: 'CONFIRM' })}>
                    {pendingOver?.goesOver ? `Go over budget · Confirm ${s.pendingOption}` : `Confirm Option ${s.pendingOption ?? ''}`}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-[20px] text-slate-700">
                  <span className="display font-bold text-ink">Representatives:</span> click your group on the right, choose an option, confirm.
                  <span className="ml-3 text-slate-500">Instructor: click a locked group to undo.</span>
                  {!ready && (
                    <div className="display mt-0.5 text-[16px] font-bold text-gold-700">
                      {s.groups.length - lockedCount} group{s.groups.length - lockedCount === 1 ? '' : 's'} still deciding. Revealing now means they sit this round out.
                    </div>
                  )}
                </div>
                <Button size="lg" variant={ready ? 'primary' : 'gold'} onClick={() => dispatch({ type: 'REVEAL' })}>
                  Reveal Round {s.round}
                  {!ready && ` (${lockedCount}/${s.groups.length})`}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right rail: groups */}
        <aside className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-slate-100 p-3">
          <div className="mb-2 flex items-baseline justify-between px-1">
            <span className="display text-[18px] font-bold text-ink">Steering committees</span>
            <span className="tabular text-[15px] font-semibold text-slate-600">
              {lockedCount}/{s.groups.length} locked
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {s.groups.map((g, i) => (
              <GroupTile
                key={g.id}
                index={i}
                name={g.name}
                remaining={totalsThrough(s.choices[g.id] ?? {}, s.round).remaining}
                lockedOption={s.choices[g.id]?.[s.round] ?? null}
                active={s.activeGroupId === g.id}
                onClick={() => dispatch({ type: 'SELECT_GROUP', groupId: g.id })}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
