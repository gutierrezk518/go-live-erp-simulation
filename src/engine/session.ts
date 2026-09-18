import type { OptionId } from '../config/rounds'
import type { Choices } from './scoring'

export type Phase = 'setup' | 'brief' | 'decide' | 'reveal' | 'final'
export type RoundNumber = 1 | 2 | 3 | 4

export interface Group {
  id: string
  name: string
}

export interface Session {
  version: 1
  startedAt: string
  groups: Group[]
  choices: Record<string, Choices>
  round: RoundNumber
  phase: Phase
  /** Group whose representative is at the keyboard right now. */
  activeGroupId: string | null
  /** Option clicked but not yet confirmed. */
  pendingOption: OptionId | null
  /** Final screen: has the readiness multiplier been applied (the dramatic beat)? */
  realized: boolean
  showBenchmark: boolean
}

export const STORAGE_KEY = 'go-live-session-v1'

export const emptySession = (): Session => ({
  version: 1,
  startedAt: new Date().toISOString(),
  groups: [],
  choices: {},
  round: 1,
  phase: 'setup',
  activeGroupId: null,
  pendingOption: null,
  realized: false,
  showBenchmark: false,
})

export type Action =
  | { type: 'START'; names: string[] }
  | { type: 'RESUME'; session: Session }
  | { type: 'BEGIN_ROUNDS' }
  | { type: 'SHOW_BRIEF' }
  | { type: 'STEP_BACK' }
  | { type: 'SELECT_GROUP'; groupId: string }
  | { type: 'PICK_OPTION'; option: OptionId }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' }
  | { type: 'UNLOCK'; groupId: string }
  | { type: 'REVEAL' }
  | { type: 'NEXT_ROUND' }
  | { type: 'SHOW_FINAL' }
  | { type: 'APPLY_MULTIPLIER' }
  | { type: 'TOGGLE_BENCHMARK' }
  | { type: 'RESET' }

export function reducer(s: Session, a: Action): Session {
  switch (a.type) {
    case 'START': {
      const groups = a.names.map((name, i) => ({ id: `g${i + 1}`, name: name.trim() || `Group ${i + 1}` }))
      const choices: Record<string, Choices> = {}
      for (const g of groups) choices[g.id] = {}
      return { ...emptySession(), groups, choices, phase: 'brief' }
    }
    case 'RESUME':
      return a.session
    case 'BEGIN_ROUNDS':
      return { ...s, phase: 'decide' }
    case 'SHOW_BRIEF':
      return { ...s, phase: 'brief' }
    /**
     * Undo exactly one forward step, wherever we are. Every screen is derived from the
     * stored choices rather than from accumulated mutations, so stepping backward never
     * loses a group's answer — the round you return to still has everything locked in,
     * ready to be unlocked and changed if that is why you came back.
     */
    case 'STEP_BACK': {
      const cleared = { ...s, activeGroupId: null, pendingOption: null }
      if (s.phase === 'final' && s.realized) return { ...cleared, realized: false }
      if (s.phase === 'final') return { ...cleared, phase: 'reveal', round: 4 }
      if (s.phase === 'reveal') return { ...cleared, phase: 'decide' }
      if (s.phase === 'decide') {
        if (s.round > 1) return { ...cleared, phase: 'reveal', round: (s.round - 1) as RoundNumber }
        return { ...cleared, phase: 'brief' }
      }
      return s
    }
    case 'SELECT_GROUP': {
      // Clicking a locked tile unlocks it (instructor undo). Clicking a pending tile makes it active.
      const locked = s.choices[a.groupId]?.[s.round]
      if (locked) {
        const choices = { ...s.choices, [a.groupId]: { ...s.choices[a.groupId] } }
        delete choices[a.groupId][s.round]
        return { ...s, choices, activeGroupId: a.groupId, pendingOption: null }
      }
      return { ...s, activeGroupId: a.groupId, pendingOption: null }
    }
    case 'PICK_OPTION':
      if (!s.activeGroupId) return s
      return { ...s, pendingOption: a.option }
    case 'CONFIRM': {
      if (!s.activeGroupId || !s.pendingOption) return s
      const choices = {
        ...s.choices,
        [s.activeGroupId]: { ...s.choices[s.activeGroupId], [s.round]: s.pendingOption },
      }
      return { ...s, choices, activeGroupId: null, pendingOption: null }
    }
    case 'CANCEL':
      return { ...s, activeGroupId: null, pendingOption: null }
    case 'UNLOCK': {
      const choices = { ...s.choices, [a.groupId]: { ...s.choices[a.groupId] } }
      delete choices[a.groupId][s.round]
      return { ...s, choices, activeGroupId: null, pendingOption: null }
    }
    case 'REVEAL':
      return { ...s, phase: 'reveal', activeGroupId: null, pendingOption: null }
    case 'NEXT_ROUND':
      if (s.round >= 4) return s
      return { ...s, round: (s.round + 1) as RoundNumber, phase: 'decide' }
    case 'SHOW_FINAL':
      return { ...s, phase: 'final' }
    case 'APPLY_MULTIPLIER':
      return { ...s, realized: true }
    case 'TOGGLE_BENCHMARK':
      return { ...s, showBenchmark: !s.showBenchmark }
    case 'RESET':
      return emptySession()
  }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (parsed?.version !== 1 || !Array.isArray(parsed.groups)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(s: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable: the in-memory session still works */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Plain-English name for where STEP_BACK would land, used as the button's tooltip so the
 * instructor can confirm the destination before clicking. null means back is unavailable.
 */
export function backTarget(s: Session): string | null {
  if (s.phase === 'final' && s.realized) return 'the projections, before the multiplier was applied'
  if (s.phase === 'final') return 'the Round 4 consequences'
  if (s.phase === 'reveal') return `the Round ${s.round} decisions, where choices can still be changed`
  if (s.phase === 'decide') return s.round > 1 ? `the Round ${s.round - 1} results` : 'the case briefing'
  return null
}

/** True once every group has locked a choice for the current round. */
export function allLocked(s: Session): boolean {
  return s.groups.length > 0 && s.groups.every((g) => !!s.choices[g.id]?.[s.round])
}
