import {
  BUDGET,
  COUNT_UNSPENT_IN_NET,
  OVERRUN_PREMIUM,
  READINESS_BANDS,
  ROUNDS,
  VALUE_HORIZON_YEARS,
  getOption,
  type OptionId,
  type RoundOption,
} from '../config/rounds'

export type Choices = Partial<Record<1 | 2 | 3 | 4, OptionId>>

export interface GroupTotals {
  spend: number
  annualValue: number
  readiness: number
  /** Budget left; negative when the group is over budget. */
  remaining: number
  /** Amount spent above BUDGET (0 when within budget). */
  overrun: number
  roundsDecided: number
}

export function totalsThrough(choices: Choices, throughRound: number): GroupTotals {
  let spend = 0
  let annualValue = 0
  let readiness = 0
  let roundsDecided = 0
  for (const r of ROUNDS) {
    if (r.number > throughRound) break
    const id = choices[r.number]
    if (!id) continue
    const o = getOption(r.number, id)
    spend += o.cost
    annualValue += o.annualValue
    readiness += o.readiness
    roundsDecided += 1
  }
  return {
    spend: round2(spend),
    annualValue: round2(annualValue),
    readiness,
    remaining: round2(BUDGET - spend),
    overrun: round2(Math.max(0, spend - BUDGET)),
    roundsDecided,
  }
}

export function bandFor(readiness: number) {
  return READINESS_BANDS.find((b) => readiness >= b.min) ?? READINESS_BANDS[READINESS_BANDS.length - 1]
}

export function readinessLabel(readiness: number): string {
  return bandFor(readiness).label
}

export function overrunPremium(overrun: number) {
  return round2(overrun * OVERRUN_PREMIUM)
}

/**
 * The group's cumulative cash position at the end of `throughRound` — what the chart plots
 * during play.
 *
 * Money goes OUT the moment a decision is made, so the line drops as a group spends.
 * Value only pulls the line back up once the thing they funded is actually running: a
 * decision made in round i has been delivering for (throughRound − i) periods, so it
 * contributes nothing in the round it is bought and accrues from the next round onward.
 *
 * The result is a J-curve. Every group digs a hole during implementation; the hole is
 * paid back (or not) at the final reveal, where the readiness multiplier lands.
 */
export function cashPositionThrough(choices: Choices, throughRound: number): number {
  let spend = 0
  let valueDelivered = 0
  for (const r of ROUNDS) {
    if (r.number > throughRound) break
    const id = choices[r.number]
    if (!id) continue
    const o = getOption(r.number, id)
    spend += o.cost
    valueDelivered += o.annualValue * (throughRound - r.number)
  }
  const overrun = Math.max(0, spend - BUDGET)
  return round2(valueDelivered - spend - overrunPremium(overrun))
}

export interface FinalResult {
  spend: number
  unspent: number
  overrun: number
  overrunPremium: number
  annualValue: number
  readiness: number
  readinessLabel: string
  multiplier: number
  disruption: number
  realizedValue: number
  net: number
  roi: number // fraction, e.g. 1.8 = +180%
}

export function finalResult(choices: Choices): FinalResult {
  const t = totalsThrough(choices, 4)
  const band = bandFor(t.readiness)
  const realizedValue = round2(t.annualValue * VALUE_HORIZON_YEARS * band.multiplier)
  const unspent = round2(Math.max(0, BUDGET - t.spend))
  const premium = overrunPremium(t.overrun)
  let net = realizedValue - t.spend - premium - band.disruption
  if (COUNT_UNSPENT_IN_NET) net += unspent
  net = round2(net)
  const invested = t.spend + premium
  const roi = invested > 0 ? net / invested : 0
  return {
    spend: t.spend,
    unspent,
    overrun: t.overrun,
    overrunPremium: premium,
    annualValue: t.annualValue,
    readiness: t.readiness,
    readinessLabel: band.label,
    multiplier: band.multiplier,
    disruption: band.disruption,
    realizedValue,
    net,
    roi,
  }
}

/**
 * What choosing `option` this round does to the group's budget position:
 * how far over budget it would put them, and the extra premium that creates.
 */
export function overrunIfChosen(choices: Choices, roundNumber: number, option: RoundOption) {
  const before = totalsThrough(choices, roundNumber - 1)
  const spendAfter = round2(before.spend + option.cost)
  const overrunAfter = round2(Math.max(0, spendAfter - BUDGET))
  const addedOverrun = round2(overrunAfter - before.overrun)
  return {
    remaining: before.remaining,
    remainingAfter: round2(BUDGET - spendAfter),
    goesOver: overrunAfter > 0 && addedOverrun > 0,
    addedOverrun,
    addedPremium: overrunPremium(addedOverrun),
  }
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export const fmtM = (n: number, opts: { sign?: boolean } = {}) => {
  const abs = Math.abs(n)
  const s = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2).replace(/\.?0+$/, '')
  const sign = n < 0 ? '−' : opts.sign && n > 0 ? '+' : ''
  return `${sign}$${s}M`
}
export const fmtPct = (f: number) => `${f > 0 ? '+' : f < 0 ? '−' : ''}${Math.round(Math.abs(f) * 100)}%`
