import { useEffect, useReducer, useRef } from 'react'
import { finalResult } from './engine/scoring'
import { clearSession, emptySession, loadSession, reducer, saveSession, type Session } from './engine/session'
import { BriefScreen } from './screens/BriefScreen'
import { DecisionScreen } from './screens/DecisionScreen'
import { FinalScreen } from './screens/FinalScreen'
import { RevealScreen } from './screens/RevealScreen'
import { SetupScreen } from './screens/SetupScreen'

export default function App() {
  const saved = useRef<Session | null>(loadSession())
  // Restore automatically if a run is in progress; the Setup screen still offers Resume explicitly.
  const [s, dispatch] = useReducer(reducer, null, () => {
    const sv = saved.current
    return sv && sv.phase !== 'setup' ? sv : emptySession()
  })

  // Autosave after every state change.
  useEffect(() => {
    if (s.phase === 'setup') return
    saveSession(s)
  }, [s])

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      session: s,
      results: s.groups.map((g) => ({ group: g.name, choices: s.choices[g.id], ...finalResult(s.choices[g.id] ?? {}) })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `go-live-session-${s.startedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const newSession = () => {
    if (!window.confirm('Start a new session? The current results stay in the exported JSON only.')) return
    clearSession()
    saved.current = null
    dispatch({ type: 'RESET' })
  }

  switch (s.phase) {
    case 'setup':
      return (
        <SetupScreen
          saved={saved.current}
          onStart={(names) => dispatch({ type: 'START', names })}
          onResume={() => saved.current && dispatch({ type: 'RESUME', session: saved.current })}
        />
      )
    case 'brief': {
      const returning = Object.values(s.choices).some((c) => Object.keys(c).length > 0)
      return <BriefScreen groupCount={s.groups.length} returning={returning} onBegin={() => dispatch({ type: 'BEGIN_ROUNDS' })} />
    }
    case 'decide':
      return <DecisionScreen s={s} dispatch={dispatch} />
    case 'reveal':
      return <RevealScreen s={s} dispatch={dispatch} />
    case 'final':
      return <FinalScreen s={s} dispatch={dispatch} onExport={exportJson} onNewSession={newSession} />
  }
}
