import type { RoundOption } from '../config/rounds'
import { fmtM } from '../engine/scoring'

interface Props {
  option: RoundOption
  /** A group is at the keyboard, so cards accept clicks. */
  enabled: boolean
  selected: boolean
  /** Choosing this option would push the active group over budget. */
  goesOver: boolean
  addedOverrun: number
  addedPremium: number
  onPick: () => void
}

export function OptionCard({ option, enabled, selected, goesOver, addedOverrun, addedPremium, onPick }: Props) {
  const state = !enabled
    ? 'border-slate-200 bg-white opacity-60'
    : selected
      ? goesOver
        ? 'border-gold-700 bg-gold-50 ring-4 ring-gold/50 shadow-md'
        : 'border-cherry bg-cherry-50 ring-4 ring-cherry/25 shadow-md'
      : goesOver
        ? 'border-gold bg-white hover:border-gold-700 hover:shadow-md cursor-pointer'
        : 'border-slate-300 bg-white hover:border-cherry hover:shadow-md cursor-pointer'
  return (
    <button
      disabled={!enabled}
      onClick={onPick}
      className={`flex h-full w-full flex-col rounded-xl border-2 p-5 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-cherry/40 ${state}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`display grid h-12 w-12 shrink-0 place-items-center rounded-lg text-[28px] font-black ${selected ? 'bg-cherry text-white' : 'bg-ink text-white'}`}
        >
          {option.id}
        </span>
        <span className="display tabular text-right text-[34px] font-black leading-none text-ink">{fmtM(option.cost)}</span>
      </div>
      <div className="display mt-4 text-[26px] font-bold leading-tight text-ink">{option.label}</div>
      <div className="mt-2 text-[19px] leading-snug text-slate-700">{option.description}</div>
      <div className="mt-auto pt-3">
        {enabled && goesOver && (
          <div className="display rounded-md bg-gold-50 px-2.5 py-1.5 text-[16px] font-bold text-gold-700">
            Over budget by {fmtM(addedOverrun)} · board overrun premium adds {fmtM(addedPremium)}
          </div>
        )}
      </div>
    </button>
  )
}
