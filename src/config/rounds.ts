/**
 * ALL tunable numbers for the simulation live in this file.
 * Retune costs, values, readiness, multiplier bands, or narratives here —
 * no component code needs to change.
 *
 * Cost          $M, deducted from the group's remaining budget immediately.
 * Annual Value  $M/yr, added to the group's running annual business value.
 * Readiness     hidden modifier; shown as a word (never a number) until the final screen.
 */

export type OptionId = 'A' | 'B' | 'C' | 'D'

export interface RoundOption {
  id: OptionId
  label: string
  description: string
  cost: number
  annualValue: number
  readiness: number
  /** In-world consequence shown at reveal. Business outcome, never scoring feedback. */
  consequence: string
}

export interface RoundConfig {
  number: 1 | 2 | 3 | 4
  title: string
  prompt: string
  /** Optional one-line situational context under the prompt. */
  context?: string
  options: RoundOption[]
}

export const BUDGET = 15 // $M
export const VALUE_HORIZON_YEARS = 5

/**
 * Going over budget is allowed. The board will fund an overrun, but every dollar
 * above BUDGET carries this premium (interest, contingency, renegotiated contracts).
 * 0.5 → each $1M over budget costs $1.5M in total. The premium is charged at the end.
 */
export const OVERRUN_PREMIUM = 0.5
export const OVERRUN_RULE = 'You may go over budget. The board will fund an overrun, but every $1 over $15M costs $1.50.'

/**
 * Readiness → realization multiplier. Evaluated top-down; first match wins.
 * `disruption` is an additional one-time cost ($M) applied at the final reveal.
 */
export const READINESS_BANDS: { min: number; multiplier: number; label: string; disruption: number }[] = [
  { min: 10, multiplier: 1.5, label: 'Rock Solid', disruption: 0 },
  { min: 6, multiplier: 1.2, label: 'Solid', disruption: 0 },
  { min: 2, multiplier: 1.0, label: 'Steady', disruption: 0 },
  { min: -1, multiplier: 0.7, label: 'Shaky', disruption: 0 },
  { min: -Infinity, multiplier: 0.4, label: 'Fragile', disruption: 6 },
]

/**
 * Whether unspent budget is added to Net Result.
 * false → Net Result = Realized 5-Yr Value − Total Spend − Disruption   (money you did not
 *         spend is simply kept; it is not counted as a return on the investment).
 * true  → the unspent amount is added to Net Result as well.
 * The PRD balance paths (invest-well ≈ +180%, skimp = net loss) only hold with `false`,
 * so that is the default. Unspent budget is always shown in the results table either way.
 */
export const COUNT_UNSPENT_IN_NET = false

/** The real-world counterfactual drawn on the final chart. */
export const BENCHMARK = {
  label: 'Revlon, 2018: −$117M',
  value: -117,
  detail: '$64M in lost sales + $53M in remediation after the SAP S/4HANA go-live at the Oxford, NC plant.',
}

export const ROUNDS: RoundConfig[] = [
  {
    number: 1,
    title: 'Scope & Timeline',
    prompt: 'The board has approved the program. How big a bite do you take?',
    context:
      'Three legacy systems, three plants, one distribution center, and an acquired refrigeration brand still running on its own stack.',
    options: [
      {
        id: 'A',
        label: 'Big bang',
        description: 'All modules, all sites, one cut-over. Live in 12 months.',
        cost: 5.0,
        annualValue: 2.0,
        readiness: -2,
        consequence:
          'The program office is energized. One date, one team, one target, and the vendor loves the ambition. Every department is now on the critical path at the same time, and the project calendar has no white space in it.',
      },
      {
        id: 'B',
        label: 'Phased by module',
        description: 'Finance first, then supply chain, then sales. 24 months.',
        cost: 6.5,
        annualValue: 1.5,
        readiness: 2,
        consequence:
          'Finance went live on schedule. The close dropped from 15 days to 9. Warehouse staff are still keying orders into the old system, and they are not happy about the double entry.',
      },
      {
        id: 'C',
        label: 'Pilot one plant',
        description: 'Prove it at the smallest plant, then roll out to the rest. 30 months.',
        cost: 4.0,
        annualValue: 0.8,
        readiness: 3,
        consequence:
          'The pilot plant found 140 issues in the first month, most of them small. The other two plants are watching, and a few of their managers have started asking to go next. The CFO has asked, politely, when the finance benefits arrive.',
      },
      {
        id: 'D',
        label: 'Minimum viable',
        description: 'Finance only. Everything else stays where it is. 9 months.',
        cost: 2.5,
        annualValue: 0.6,
        readiness: 0,
        consequence:
          'Finance is live and the auditors are pleased. Inventory is still counted two different ways, sales still quotes from a stale credit report, and the acquired brand still runs on its own systems. The board is asking what the rest of the plan is.',
      },
    ],
  },
  {
    number: 2,
    title: 'Platform & Data',
    prompt: 'You have a platform to choose and twenty years of messy legacy data to bring with you.',
    context:
      'Two systems count inventory differently. Dealer records are duplicated across the acquired refrigeration brand. Nobody owns the part master. A cleanup workstream was not in the original budget request.',
    options: [
      {
        id: 'A',
        label: 'Latest cloud suite, data as-is',
        description: 'Newest platform. Migrate historical data exactly as it sits today.',
        cost: 3.0,
        annualValue: 2.2,
        readiness: -2,
        consequence:
          'The migration finished ahead of schedule and the demo of the new dashboards drew applause. Forty thousand part numbers and every dealer record moved over in one weekend. Some of the inventory counts look a little odd, but that was true in the old system too.',
      },
      {
        id: 'B',
        label: 'Latest cloud suite + data cleanup',
        description: 'Newest platform, plus a dedicated workstream to clean and reconcile the data first.',
        cost: 4.5,
        annualValue: 2.8,
        readiness: 3,
        consequence:
          'Six months of unglamorous work. The cleanup team found 4,000 duplicate dealer records, 900 part numbers for equipment nobody has built since 2011, and two plants that had been counting sub-assemblies differently for a decade. For the first time, one inventory number is the inventory number.',
      },
      {
        id: 'C',
        label: 'Proven prior-generation platform',
        description: 'On-premise, well understood, plenty of experienced consultants available.',
        cost: 3.5,
        annualValue: 1.4,
        readiness: 1,
        consequence:
          'Implementation was calm. Your integrator has done this exact build a dozen times and it shows. The vendor has announced end of mainstream support for this version in four years, and the analytics team is already asking about the cloud roadmap.',
      },
      {
        id: 'D',
        label: 'Latest cloud suite, cleanup later',
        description: 'Newest platform now. Data cleanup becomes a phase-2 item.',
        cost: 2.8,
        annualValue: 1.8,
        readiness: -1,
        consequence:
          'The steering committee agreed that cleanup is important and added it to the phase-2 backlog. The platform is up and the vendor is happy. A few power users have noticed that the same dealer sometimes appears three times in the new system, and they have started keeping their own spreadsheets.',
      },
    ],
  },
  {
    number: 3,
    title: 'People & Change',
    prompt: '4,200 people have to actually use this thing.',
    context:
      'Plant supervisors average 19 years of tenure. Most learned the current systems from the person before them.',
    options: [
      {
        id: 'A',
        label: 'Vendor-led training',
        description: '4 hours per user, delivered the week of go-live.',
        cost: 0.8,
        annualValue: 0.3,
        readiness: -2,
        consequence:
          'Training is scheduled and the vendor has sent excellent slide decks. Attendance is mandatory. Several plant supervisors have asked whether the four hours can be moved, since that week is also month-end.',
      },
      {
        id: 'B',
        label: 'Super-user program',
        description: '40 internal champions trained early, one per team, to support their peers.',
        cost: 2.0,
        annualValue: 1.2,
        readiness: 4,
        consequence:
          'Forty people now know the new system cold, and they are the ones their coworkers already go to for help. The champions have surfaced dozens of process questions nobody at headquarters had thought of. Two of them have been promoted.',
      },
      {
        id: 'C',
        label: 'Full change program',
        description: 'Communications, champions, manager accountability, and a practice sandbox for every user.',
        cost: 3.2,
        annualValue: 1.6,
        readiness: 5,
        consequence:
          'Every manager has a go-live readiness score on their scorecard. The sandbox has logged 11,000 practice sessions. Grumbling is real, but it is grumbling about specific screens, which means people have actually used them.',
      },
      {
        id: 'D',
        label: 'Self-serve e-learning',
        description: 'Online modules available to everyone. Complete at your own pace.',
        cost: 0.4,
        annualValue: 0.1,
        readiness: -3,
        consequence:
          'The e-learning portal is live and the completion dashboard looks green. Headquarters staff finished quickly. Plant floor completion is at 31 percent, mostly people clicking through on their phones during breaks.',
      },
    ],
  },
  {
    number: 4,
    title: 'Go-Live',
    prompt: 'Three weeks out. Testing at your largest plant is not complete.',
    context:
      'The board has been promised a date. The integrator says the remaining defects are mostly cosmetic. Your plant manager disagrees. The CFO has confirmed the board will fund an overrun if you ask, at a price.',
    options: [
      {
        id: 'A',
        label: 'Go live on the original date',
        description: 'All sites, as planned. Fix remaining issues in production.',
        cost: 0.5,
        annualValue: 0,
        readiness: 0,
        consequence:
          'The switch is thrown at midnight on schedule. The executive team sends a congratulations email at 6 a.m. By noon, the warehouse is discovering which of the untested scenarios actually mattered.',
      },
      {
        id: 'B',
        label: 'Two full test cycles',
        description: 'Production-like environment, real data, real users. 8-week delay.',
        cost: 2.5,
        annualValue: 0,
        readiness: 3,
        consequence:
          'The board grumbled about the slip. The second test cycle caught a pricing error that would have under-billed your largest dealer by 4 percent on every invoice. Go-live itself was, by ERP standards, boring.',
      },
      {
        id: 'C',
        label: 'Pilot site first, then waves',
        description: 'Smallest plant goes live first. The rest follow in waves as issues are fixed.',
        cost: 1.8,
        annualValue: 0,
        readiness: 2,
        consequence:
          'The pilot plant hit real problems in week one, and the team fixed them before the big plant ever saw them. Each wave went smoother than the last. Nobody got a congratulations email, but nobody needed one.',
      },
      {
        id: 'D',
        label: 'Delay six months',
        description: 'Push the date. Run additional testing across every site.',
        cost: 3.5,
        annualValue: -1.5,
        readiness: 3,
        consequence:
          'Six more months of running two systems in parallel, paying two license bills, and holding a project team together that expected to be done. The eventual go-live was clean. The CFO has quietly reopened the business case.',
      },
    ],
  },
]

/** Helper so component code can look up an option by round and letter. */
export function getOption(round: number, id: OptionId): RoundOption {
  const r = ROUNDS.find((x) => x.number === round)
  if (!r) throw new Error(`No round ${round}`)
  const o = r.options.find((x) => x.id === id)
  if (!o) throw new Error(`No option ${id} in round ${round}`)
  return o
}
