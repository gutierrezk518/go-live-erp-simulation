/**
 * Prints the outcome of the three reference paths from the PRD plus a few extras.
 * Run:  npm run balance
 */
import { BUDGET, ROUNDS } from '../src/config/rounds'
import { cashPositionThrough, finalResult, fmtM, fmtPct, type Choices } from '../src/engine/scoring'

const paths: { name: string; c: Choices }[] = [
  { name: 'Invest well   (1B 2B 3B 4C)', c: { 1: 'B', 2: 'B', 3: 'B', 4: 'C' } },
  { name: 'Middle road   (1A 2D 3B 4C)', c: { 1: 'A', 2: 'D', 3: 'B', 4: 'C' } },
  { name: 'Skimp         (1D 2D 3D 4A)', c: { 1: 'D', 2: 'D', 3: 'D', 4: 'A' } },
  { name: 'Big bang+data (1A 2B 3C 4A)', c: { 1: 'A', 2: 'B', 3: 'C', 4: 'A' } },
  { name: 'Pilot+change  (1C 2B 3C 4C)', c: { 1: 'C', 2: 'B', 3: 'C', 4: 'C' } },
  { name: 'Overspend try (1B 2B 3C 4B)', c: { 1: 'B', 2: 'B', 3: 'C', 4: 'B' } },
]

console.log(`Budget $${BUDGET}M\n`)
console.log(
  'Path'.padEnd(32),
  'Spend'.padStart(8),
  'Ready'.padStart(6),
  'Mult'.padStart(6),
  'Realized'.padStart(10),
  'Net'.padStart(9),
  'ROI'.padStart(7),
)
for (const p of paths) {
  const r = finalResult(p.c)
  const over = r.overrun > 0 ? `  ← over budget by ${fmtM(r.overrun)}, premium ${fmtM(r.overrunPremium)}` : ''
  console.log(
    p.name.padEnd(32),
    fmtM(r.spend).padStart(8),
    String(r.readiness).padStart(6),
    `${r.multiplier}×`.padStart(6),
    fmtM(r.realizedValue).padStart(10),
    fmtM(r.net, { sign: true }).padStart(9),
    fmtPct(r.roi).padStart(7),
    over,
  )
}

// The on-screen line: cash position after each round, then the realized jump.
console.log('\nChart trajectory (what the class watches)\n')
console.log('Path'.padEnd(32), 'R1'.padStart(9), 'R2'.padStart(9), 'R3'.padStart(9), 'R4'.padStart(9), '→ Realized'.padStart(12))
for (const p of paths) {
  const pts = [1, 2, 3, 4].map((r) => fmtM(cashPositionThrough(p.c, r), { sign: true }).padStart(9))
  console.log(p.name.padEnd(32), ...pts, fmtM(finalResult(p.c).net, { sign: true }).padStart(12))
}

// Exhaustive sweep over all 256 paths.
let within = 0
let losses = 0
let best = { roi: -Infinity, key: '' }
let bestNet = { net: -Infinity, key: '' }
for (const a of ROUNDS[0].options)
  for (const b of ROUNDS[1].options)
    for (const c of ROUNDS[2].options)
      for (const d of ROUNDS[3].options) {
        const r = finalResult({ 1: a.id, 2: b.id, 3: c.id, 4: d.id })
        const key = `${a.id}${b.id}${c.id}${d.id}`
        if (r.overrun === 0) within++
        if (r.net < 0) losses++
        if (r.roi > best.roi) best = { roi: r.roi, key }
        if (r.net > bestNet.net) bestNet = { net: r.net, key }
      }
console.log(
  `\n${within} of 256 paths stay within budget; ${losses} lose money. Best ROI: ${best.key} at ${fmtPct(best.roi)}. Best net: ${bestNet.key} at ${fmtM(bestNet.net, { sign: true })}.`,
)
