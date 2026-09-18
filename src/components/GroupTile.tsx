import { fmtM } from '../engine/scoring'
import { markerPath, seriesStyle } from './series'

interface Props {
  index: number
  name: string
  remaining: number
  lockedOption: string | null
  active: boolean
  onClick: () => void
}

export function GroupTile({ index, name, remaining, lockedOption, active, onClick }: Props) {
  const st = seriesStyle(index)
  const locked = !!lockedOption
  const border = active
    ? 'border-cherry ring-4 ring-cherry/25 bg-cherry-50'
    : locked
      ? 'border-slate-200 bg-white'
      : 'border-slate-300 bg-white hover:border-cherry hover:bg-cherry-50/40'
  return (
    <button
      onClick={onClick}
      title={locked ? 'Click to unlock and change this choice' : 'Click to make this group’s choice'}
      className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-cherry/40 ${border}`}
    >
      <svg width="22" height="22" viewBox="-11 -11 22 22" aria-hidden className="shrink-0">
        <path d={markerPath(st.shape, 7)} fill={st.color} stroke="#fff" strokeWidth={1.5} />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="display truncate text-[20px] font-bold leading-tight text-ink">{name}</div>
        <div className={`tabular text-[14px] ${remaining < 0 ? 'font-bold text-danger' : 'text-slate-600'}`}>
          {remaining < 0 ? `${fmtM(-remaining)} over budget` : `${fmtM(remaining)} left`}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {locked ? (
          <span className="display grid h-9 w-9 place-items-center rounded-md bg-ink text-[20px] font-black text-white">
            {lockedOption}
          </span>
        ) : (
          <span
            className={`h-3.5 w-3.5 rounded-full ${active ? 'bg-cherry animate-pulse' : 'bg-slate-300'}`}
            aria-label={active ? 'choosing' : 'pending'}
          />
        )}
      </div>
    </button>
  )
}
