import { useEffect, useState } from 'react'
import { Link } from '../lib/router'
import { Lock } from './Icons'
import './Navbar.css'

/**
 * Floating pill navbar — same behaviour as minutex.ai:
 * transparent at the top, white/blurred with a soft shadow once scrolled past 16px.
 * `children` renders in the centre slot (e.g. the checkout stepper).
 */
export default function Navbar({ children, secureLabel = 'Secure checkout' }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="mx-nav">
      <div className={`mx-nav__bar${scrolled ? ' is-scrolled' : ''}${children ? ' has-center' : ''}`}>
        <Link to="/" className="mx-nav__logo" aria-label="MinuteX home">
          <img src="/images/minutex-logo.png" alt="MinuteX" width="125" height="28" />
        </Link>
        {children && <div className="mx-nav__center">{children}</div>}
        <span className="mx-nav__secure">
          <span className="mx-nav__secure-icon"><Lock size={14} strokeWidth={2.4} /></span>
          <span className="mx-nav__secure-text">{secureLabel}</span>
        </span>
      </div>
    </header>
  )
}
