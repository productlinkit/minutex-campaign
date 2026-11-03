import { useInView, usePrefersReducedMotion } from '../hooks/useMotion'
import { Link } from '../lib/router'
import LiveTranscript from './LiveTranscript'
import { ArrowRight, Check } from './Icons'
import './RecallSection.css'

const TITLE = [['Sure', 'you', 'remember'], ['what', 'that', 'meeting', 'covered?']]
const FADING_WORD = 'remember'

export default function RecallSection() {
  const [ref, inView] = useInView(0.25)
  const reduce = usePrefersReducedMotion()
  let wordIndex = 0

  return (
    <section ref={ref} id="campaign-recall" className={`mx-recall${inView ? ' is-in' : ''}`} aria-labelledby="mx-recall-title">
      <div className="mx-recall__sky" aria-hidden="true" />

      <div className="mx-container">
        <div className="mx-copy">
          <p className="mx-eyebrow mx-reveal">Meeting Recall</p>
          <h2 className="mx-title" id="mx-recall-title">
            {TITLE.map((row, r) => (
              <span key={r}>
                {row.map((word) => {
                  const i = wordIndex++
                  return (
                    <span key={word}>
                      <span className={`w${word === FADING_WORD ? ' mx-fade' : ''}`} style={{ '--i': i }}>{word}</span>{' '}
                    </span>
                  )
                })}
                {r < TITLE.length - 1 && <br />}
              </span>
            ))}
          </h2>

          <p className="mx-lead mx-reveal" style={{ '--d': '600ms' }}>
            The meeting ends, and the details slip away.{' '}
            <strong>Who owns what, when it&rsquo;s due, what everyone agreed on</strong> — MinuteX
            captures it all in real time, so you can stay focused on the conversation.
          </p>

          <div className="mx-ctas mx-reveal" style={{ '--d': '750ms' }}>
            <Link className="mx-btn mx-btn--primary" to="/checkout">
              Let MinuteX Remember <ArrowRight />
            </Link>
          </div>

          <div className="mx-note mx-reveal" style={{ '--d': '900ms' }}>
            <span><Check />Free 300 minutes/month</span>
            <span><Check />Zoom, Google Meet &amp; Teams</span>
          </div>
        </div>

        <LiveTranscript active={inView} reduce={reduce} />
      </div>
    </section>
  )
}
