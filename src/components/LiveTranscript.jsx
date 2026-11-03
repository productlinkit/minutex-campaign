import { useEffect, useRef, useState } from 'react'
import { people, script, MEETING_START_SECS } from '../data/meeting'
import { Check, Sparkle, Video } from './Icons'

const MAX_LINES = 6
const BAR_COUNT = 26

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// random waveform shape, generated once per module load
const BARS = Array.from({ length: BAR_COUNT }, () => ({
  delay: `${(-Math.random()).toFixed(2)}s`,
  height: `${40 + Math.round(Math.random() * 60)}%`,
}))

export default function LiveTranscript({ active, reduce }) {
  const [secs, setSecs] = useState(MEETING_START_SECS)
  const secsRef = useRef(secs)
  secsRef.current = secs

  // each line: { id, idx (into script), at (secs), words (typed so far), tagShown }
  const [lines, setLines] = useState([])
  const [captured, setCaptured] = useState([]) // script indices whose tag was detected
  const [speaker, setSpeaker] = useState(null) // person key or null
  const [status, setStatus] = useState('listening') // 'listening' | 'done'
  const [talking, setTalking] = useState(false)

  // meeting clock
  useEffect(() => {
    if (!active || reduce) return
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [active, reduce])

  // transcript playback loop
  useEffect(() => {
    if (!active) return

    if (reduce) {
      setLines(script.map((item, i) => ({ id: i, idx: i, at: MEETING_START_SECS + i * 60, words: Infinity, tagShown: true })).slice(-MAX_LINES))
      setCaptured(script.flatMap((item, i) => (item.tag ? [i] : [])))
      return
    }

    let cancelled = false
    const timers = new Set()
    const sleep = (ms) => new Promise((resolve) => {
      const t = setTimeout(() => { timers.delete(t); resolve() }, ms)
      timers.add(t)
    })
    const patch = (id, fields) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...fields } : l)))

    ;(async () => {
      let uid = 0
      while (!cancelled) {
        setLines([]); setCaptured([]); setStatus('listening')
        await sleep(600)

        for (let i = 0; i < script.length; i++) {
          if (cancelled) return
          const item = script[i]
          const id = uid++
          setSpeaker(item.who)
          setTalking(true)
          setLines((ls) => [...ls, { id, idx: i, at: secsRef.current, words: 0, tagShown: false }].slice(-MAX_LINES))

          const total = item.text.split(' ').length
          for (let w = 1; w <= total; w++) {
            await sleep(110 + Math.random() * 90)
            if (cancelled) return
            patch(id, { words: w })
          }
          setTalking(false)

          if (item.tag) {
            await sleep(350)
            if (cancelled) return
            patch(id, { tagShown: true })
            setCaptured((c) => [...c, i])
          }
          await sleep(1100)
        }

        setSpeaker(null)
        setStatus('done')
        await sleep(3800)
      }
    })()

    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [active, reduce])

  const counts = captured.reduce((acc, i) => {
    const type = script[i].tag.type
    if (type === 'action' || type === 'decision') acc[type]++
    return acc
  }, { action: 0, decision: 0 })

  const current = speaker && people[speaker]

  return (
    <div className="mx-stage mx-reveal" style={{ '--d': '300ms' }}>
      <div className="mx-card" role="img" aria-label="Sample live meeting transcript in MinuteX">
        <div className="mx-card__head">
          <div className="mx-meet">
            <span className="mx-meet__icon"><Video /></span>
            <div style={{ minWidth: 0 }}>
              <p className="mx-meet__title">Weekly Sync · Launch Q4</p>
              <p className="mx-meet__meta">Google Meet · 4 participants</p>
            </div>
          </div>
          <span className="mx-live"><i /><span>{fmt(secs)}</span></span>
        </div>

        <div className="mx-wave">
          <div className="mx-avatars">
            {Object.entries(people).map(([key, p]) => (
              <span key={key} title={p.name} className={`mx-av${speaker === key ? ' is-speaking' : ''}`} style={{ background: p.color }}>
                {p.init}
              </span>
            ))}
          </div>
          <span className="mx-speaker-name">
            {current
              ? <><b>{current.name}</b> · {current.role}</>
              : status === 'done' ? 'Meeting ended · minutes ready to share' : 'Listening…'}
          </span>
          <div className="mx-bars" aria-hidden="true">
            {BARS.map((b, i) => (
              <b key={i} style={{ '--bd': b.delay, '--bh': b.height, animationPlayState: talking ? 'running' : 'paused' }} />
            ))}
          </div>
        </div>

        <div className="mx-feed">
          <ul className="mx-feed__list">
            {lines.map((line, i) => {
              const item = script[line.idx]
              const p = people[item.who]
              const words = item.text.split(' ')
              const typing = line.words < words.length
              const fromEnd = lines.length - 1 - i
              const age = fromEnd >= 3 ? ' is-older' : fromEnd === 2 ? ' is-old' : ''
              return (
                <li key={line.id} className={`mx-line${age}`}>
                  <span className="mx-av" style={{ background: p.color }}>{p.init}</span>
                  <div>
                    <div className="mx-line__who"><span>{p.name}</span><time>{fmt(line.at)}</time></div>
                    <p className="mx-line__text">
                      {words.slice(0, line.words).join(' ')}
                      {typing && <span className="mx-caret" />}
                    </p>
                    {line.tagShown && item.tag && (
                      <span className={`mx-tag mx-tag--${item.tag.type}`}>{item.tag.label}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mx-card__foot">
          <span className="mx-ai"><Sparkle /> MinuteX is taking notes…</span>
          <span className="mx-counts">
            {/* key change remounts the pill so the bump animation replays */}
            <span key={`a${counts.action}`} className={`mx-count${counts.action ? ' bump' : ''}`}><b>{counts.action}</b> {counts.action === 1 ? 'task' : 'tasks'}</span>
            <span key={`d${counts.decision}`} className={`mx-count${counts.decision ? ' bump' : ''}`}><b>{counts.decision}</b> {counts.decision === 1 ? 'decision' : 'decisions'}</span>
          </span>
        </div>
      </div>

      <div className="mx-summary" aria-hidden="true">
        <div className="mx-summary__head"><span>Meeting Summary</span><span>AI</span></div>
        <ul>
          {captured.length === 0
            ? <li className="mx-summary__empty">Waiting for key points…</li>
            : captured.map((i) => (
              <li key={i}><Check size={14} strokeWidth={2.6} /><span>{script[i].sum}</span></li>
            ))}
        </ul>
      </div>
    </div>
  )
}
