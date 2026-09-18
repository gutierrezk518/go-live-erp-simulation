import { useEffect, useMemo, useRef, useState, type Key } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { BENCHMARK } from '../config/rounds'
import { cashPositionThrough, finalResult, fmtM } from '../engine/scoring'
import type { Group } from '../engine/session'
import type { Choices } from '../engine/scoring'
import { markerPath, seriesStyle } from './series'

interface Props {
  groups: Group[]
  choices: Record<string, Choices>
  /** Plot rounds 0..throughRound. */
  throughRound: number
  /** When true, the round-4 point is the realized net result (multiplier + disruption applied). */
  realized: boolean
  /**
   * Reserve vertical room for the realized values even while still showing the dip, so the
   * axis does not jump mid-animation. Only the final screen needs this; the round reveals
   * leave it off so the implementation dip fills the plot.
   */
  headroomForRealized?: boolean
  showBenchmark?: boolean
  /** Extra vertical room; the chart fills its container otherwise. */
  className?: string
}

// Deterministic plot geometry so the HTML end-labels can be positioned without
// reaching into Recharts internals.
const MARGIN = { top: 24, right: 200, bottom: 8, left: 8 }
const Y_AXIS_WIDTH = 84
const X_AXIS_HEIGHT = 56
const LABEL_H = 28
const ANIM_MS = 1500

export function ValueChart({
  groups,
  choices,
  throughRound,
  realized,
  headroomForRealized = false,
  showBenchmark = false,
  className = '',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Build rows: one per round, one column per group id.
  const rows = useMemo(() => {
    const out: Record<string, number>[] = []
    for (let r = 0; r <= throughRound; r++) {
      const row: Record<string, number> = { round: r }
      for (const g of groups) {
        const c = choices[g.id] ?? {}
        if (r === 4 && realized) row[g.id] = finalResult(c).net
        else row[g.id] = r === 0 ? 0 : cashPositionThrough(c, r)
      }
      out.push(row)
    }
    return out
  }, [groups, choices, throughRound, realized])

  // Y domain: cover every plotted value in both modes so the axis never jumps during
  // the projected→realized animation, plus the benchmark when shown.
  const [yMin, yMax, ticks] = useMemo(() => {
    // Seeded so the zero line always sits on screen with room below for the spending dip.
    let lo = -5
    let hi = 2
    for (const g of groups) {
      const c = choices[g.id] ?? {}
      for (let r = 1; r <= throughRound; r++) {
        const v = cashPositionThrough(c, r)
        lo = Math.min(lo, v)
        hi = Math.max(hi, v)
      }
      if (throughRound >= 4 && (realized || headroomForRealized)) {
        const v = finalResult(c).net
        lo = Math.min(lo, v)
        hi = Math.max(hi, v)
      }
    }
    if (showBenchmark) lo = Math.min(lo, BENCHMARK.value)
    const step = hi - lo > 80 ? 20 : hi - lo > 40 ? 10 : 5
    const min = Math.floor((lo - 2) / step) * step
    const max = Math.ceil((hi + 2) / step) * step
    const t: number[] = []
    for (let v = min; v <= max; v += step) t.push(v)
    return [min, max, t]
  }, [groups, choices, throughRound, showBenchmark, realized, headroomForRealized])

  // Plot rect in container pixels.
  const plotRight = size.w - MARGIN.right
  const plotTop = MARGIN.top
  const plotBottom = size.h - MARGIN.bottom - X_AXIS_HEIGHT
  const yToPx = (v: number) => plotTop + ((yMax - v) / (yMax - yMin || 1)) * (plotBottom - plotTop)

  // End labels, de-overlapped vertically.
  const labels = useMemo(() => {
    if (size.h === 0 || rows.length === 0) return []
    const last = rows[rows.length - 1]
    const items = groups.map((g, i) => ({ g, i, value: last[g.id] ?? 0, y: yToPx(last[g.id] ?? 0) }))
    items.sort((a, b) => a.y - b.y)
    // push apart top-down, then clamp bottom-up
    for (let k = 1; k < items.length; k++) {
      if (items[k].y - items[k - 1].y < LABEL_H) items[k].y = items[k - 1].y + LABEL_H
    }
    const maxY = plotBottom + 6
    for (let k = items.length - 1; k >= 0; k--) {
      const cap = k === items.length - 1 ? maxY : items[k + 1].y - LABEL_H
      if (items[k].y > cap) items[k].y = cap
    }
    return items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, groups, size, yMin, yMax])

  const yLabel = realized ? 'Realized 5-Year Net Result ($M)' : 'Cash Position During Implementation ($M)'

  return (
    <div ref={wrapRef} className={`relative w-full h-full ${className}`} aria-label={yLabel}>
      {size.w > 0 && size.h > 0 && (
        <LineChart width={size.w} height={size.h} data={rows} margin={MARGIN}>
          <CartesianGrid stroke="#DDE0E2" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="round"
            type="number"
            domain={[0, Math.max(throughRound, 1)]}
            ticks={Array.from({ length: throughRound + 1 }, (_, i) => i)}
            tickFormatter={(v: number) => (v === 0 ? 'Start' : `Round ${v}`)}
            tick={{ fontSize: 18, fill: '#4A4E52', fontWeight: 600 }}
            axisLine={{ stroke: '#C1C6C8' }}
            tickLine={false}
            height={X_AXIS_HEIGHT}
            tickMargin={12}
          />
          <YAxis
            domain={[yMin, yMax]}
            ticks={ticks}
            tickFormatter={(v: number) => fmtM(v).replace('.0', '')}
            tick={{ fontSize: 17, fill: '#4A4E52' }}
            axisLine={false}
            tickLine={false}
            width={Y_AXIS_WIDTH}
            label={{
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              offset: 4,
              style: { fontSize: 17, fill: '#1A1A1C', fontWeight: 700, textAnchor: 'middle' },
            }}
          />
          <ReferenceLine
            y={0}
            stroke="#8A8D8F"
            strokeWidth={2}
            label={{ value: 'Break even', position: 'insideTopLeft', fill: '#63676B', fontSize: 15, fontWeight: 700, dy: 2 }}
          />
          {showBenchmark && (
            <ReferenceLine
              y={BENCHMARK.value}
              stroke="#C8102E"
              strokeWidth={2.5}
              strokeDasharray="10 8"
              label={{
                value: BENCHMARK.label,
                position: 'insideBottomRight',
                fill: '#C8102E',
                fontSize: 20,
                fontWeight: 700,
                dy: -6,
              }}
            />
          )}
          <Tooltip
            formatter={(v, name) => [fmtM(Number(v)), String(name)]}
            labelFormatter={(v) => (Number(v) === 0 ? 'Start' : `After Round ${v}`)}
            contentStyle={{ fontSize: 16, borderRadius: 8, border: '1px solid #DDE0E2' }}
            itemSorter={(item) => -(Number(item.value) || 0)}
          />
          {groups.map((g, i) => {
            const st = seriesStyle(i)
            return (
              <Line
                key={g.id}
                type="linear"
                dataKey={g.id}
                name={g.name}
                stroke={st.color}
                strokeWidth={4}
                strokeDasharray={st.dashed ? '10 6' : undefined}
                isAnimationActive
                animationDuration={ANIM_MS}
                animationEasing="ease-in-out"
                dot={(p: { cx?: number; cy?: number; key?: Key | null }) => (
                  <path
                    key={p.key ?? undefined}
                    transform={`translate(${p.cx ?? 0},${p.cy ?? 0})`}
                    d={markerPath(st.shape, 7)}
                    fill={st.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
                activeDot={{ r: 9, strokeWidth: 2, stroke: '#fff' }}
              />
            )
          })}
        </LineChart>
      )}

      {/* Direct end-labels: one per line, rendered in HTML for crispness and de-overlap. */}
      {labels.map(({ g, i, value, y }) => {
        const st = seriesStyle(i)
        return (
          <div
            key={g.id}
            className="absolute flex items-center gap-2 whitespace-nowrap pointer-events-none"
            style={{
              left: plotRight + 12,
              top: y,
              transform: 'translateY(-50%)',
              transition: `top ${ANIM_MS}ms ease-in-out`,
            }}
          >
            <svg width="20" height="20" viewBox="-10 -10 20 20" aria-hidden>
              <path d={markerPath(st.shape, 6.5)} fill={st.color} stroke="#fff" strokeWidth={1.5} />
            </svg>
            <span className="display text-[20px] font-bold leading-none" style={{ color: '#1A1A1C' }}>
              {g.name}
            </span>
            <span className="tabular text-[17px] font-semibold" style={{ color: '#4A4E52' }}>
              {fmtM(value, { sign: true })}
            </span>
          </div>
        )
      })}
    </div>
  )
}
