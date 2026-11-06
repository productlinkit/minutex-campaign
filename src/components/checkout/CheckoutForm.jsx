import { useEffect, useRef, useState } from 'react'
import { fmtPrice, isPaid, totalDue } from '../../data/plans'
import * as api from '../../lib/checkoutApi'
import { cardBrand, digits, formatCardNumber, formatExpiry, validateCard } from '../../lib/card'
import Field from './Field'
import { Check, CreditCard, Lock, User } from '../Icons'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const LOGIN_URL = 'https://apps.minutex.ai'
const CHECK_DELAY = 600
const BRAND_LABEL = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC' }

/**
 * Single-page checkout: Email → Credit card (number, expiry, CVV) → Pay / Login.
 *
 * After the email is entered it is checked automatically:
 *   new         → card form opens, "Pay" → account is created, password emailed
 *   registered  → card form opens, "Pay" → subscription activated on the existing account
 *   subscribed  → card form hidden, login offer shown, button becomes "Login"
 * (On the Free plan there is no card: new → "Create free account", any existing account → Login.)
 *
 * NOTE: the card inputs are UI-only for this prototype. In production, replace them with
 * Stripe Elements so card data never touches MinuteX servers.
 */
export default function CheckoutForm({ plan, yearly, onComplete }) {
  const paid = isPaid(plan)
  const total = totalDue(plan, yearly)

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | new | registered | subscribed | error
  const [account, setAccount] = useState(null)
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const requestId = useRef(0)
  const cardRef = useRef(null)

  const trimmed = email.trim()
  const emailValid = EMAIL_RE.test(trimmed)
  const brand = cardBrand(card.number)

  const loginMode = status === 'subscribed' || (!paid && status === 'registered')
  const showCard = paid && (status === 'new' || status === 'registered')

  const runCheck = async (value) => {
    const id = ++requestId.current
    setStatus('checking'); setServerError('')
    try {
      const res = await api.checkEmail({ email: value })
      if (id !== requestId.current) return // a newer email was typed meanwhile
      setAccount(res)
      setStatus(res.subscribed ? 'subscribed' : res.exists ? 'registered' : 'new')
    } catch (err) {
      if (id !== requestId.current) return
      setStatus('error'); setServerError(err.message || 'Could not check this email. Please try again.')
    }
  }

  // check the email automatically once the user stops typing
  useEffect(() => {
    if (!emailValid) return
    const t = setTimeout(() => runCheck(trimmed), CHECK_DELAY)
    return () => clearTimeout(t)
  }, [trimmed, emailValid])

  // move focus to the card number when the card form opens
  useEffect(() => { if (showCard) cardRef.current?.focus({ preventScroll: true }) }, [showCard])

  const onEmailChange = (e) => {
    setEmail(e.target.value)
    requestId.current++ // invalidate any in-flight check
    setStatus('idle'); setAccount(null); setServerError('')
    setErrors((x) => ({ ...x, email: undefined }))
  }

  const setCardField = (k, fmt) => (e) => {
    setCard((c) => ({ ...c, [k]: fmt(e.target.value) }))
    setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const useDifferentEmail = () => {
    setEmail(''); setStatus('idle'); setAccount(null)
    document.getElementById('mxc-email')?.focus()
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!emailValid) { setErrors({ email: 'Enter a valid email address' }); return }
    if (status === 'idle' || status === 'error') { runCheck(trimmed); return }
    if (status === 'checking' || submitting) return
    if (loginMode) { window.location.href = LOGIN_URL; return }

    if (paid) {
      const err = validateCard(card)
      setErrors(err)
      if (Object.keys(err).length) return
    }

    setSubmitting(true); setServerError('')
    try {
      const res = paid
        ? await api.subscribe({ email: trimmed, plan_id: plan.id, period: yearly ? 'yearly' : 'monthly', card: { ...card, number: digits(card.number) } })
        : await api.registerFree({ email: trimmed })
      onComplete({ email: trimmed, receipt: paid ? res : null, accountCreated: res.account_created })
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const cardError = errors.number || errors.expiry || errors.cvc

  let buttonLabel = 'Continue'
  if (status === 'checking') buttonLabel = <><span className="mxc-spinner" /> Checking email…</>
  else if (submitting) buttonLabel = <><span className="mxc-spinner" /> {paid ? 'Processing payment…' : 'Creating account…'}</>
  else if (loginMode) buttonLabel = <><User size={16} /> Login</>
  else if (showCard) buttonLabel = <><Lock size={16} /> Pay {fmtPrice(total)}</>
  else if (!paid && status === 'new') buttonLabel = 'Create free account'

  const emailHint = {
    checking: 'Checking your email…',
    new: paid ? 'New to MinuteX — your account is created automatically after payment.' : 'New to MinuteX — we’ll create your free account.',
    registered: paid ? 'Welcome back! The subscription will be added to your existing account.' : undefined,
  }[status]

  return (
    <div className="mxc-panel">
      <h2 className="mxc-h2">{paid ? 'Checkout' : 'Get started'}</h2>
      <p className="mxc-muted">
        {paid
          ? <>Enter your email and card to subscribe to MinuteX {plan.name}.</>
          : <>Enter your email to create your free MinuteX account.</>}
      </p>
      {serverError && <p className="mxc-alert" role="alert">{serverError}</p>}

      <form className="mxc-form" onSubmit={submit} noValidate>
        {/* 1. Email */}
        <Field label="Email" htmlFor="mxc-email" error={errors.email} hint={emailHint}>
          <span className="mxc-input-wrap">
            <input id="mxc-email" className="mxc-input" type="email" value={email} onChange={onEmailChange}
              onBlur={() => { if (emailValid && status === 'idle') runCheck(trimmed) }}
              autoComplete="email" placeholder="name@company.com" autoFocus disabled={submitting}
              aria-invalid={!!errors.email} />
            <span className="mxc-input-status" aria-hidden="true">
              {status === 'checking' && <span className="mxc-spinner mxc-spinner--brand" />}
              {(status === 'new' || status === 'registered' || status === 'subscribed') && <Check size={16} strokeWidth={2.8} />}
            </span>
          </span>
        </Field>

        {/* Email registered & already subscribed → login offer */}
        {loginMode && (
          <div className="mxc-offer" role="status">
            <span className="mxc-offer__icon"><User size={20} /></span>
            <div>
              <p className="mxc-offer__title">
                {status === 'subscribed' ? 'You’re already subscribed' : 'You already have a MinuteX account'}
              </p>
              <p className="mxc-offer__text">
                {status === 'subscribed'
                  ? <><strong>{trimmed}</strong> has an active MinuteX {account?.current_plan}{account?.billing_cycle ? ` (${account.billing_cycle})` : ''} plan. Log in to manage your subscription or change plans — no need to pay again.</>
                  : <><strong>{trimmed}</strong> is already registered. Log in to start using MinuteX.</>}
              </p>
              <button type="button" className="mxc-link" onClick={useDifferentEmail}>Use a different email</button>
            </div>
          </div>
        )}

        {/* 2. Credit card — opens after the email check (new / registered, not subscribed) */}
        {showCard && (
          <div className="mxc-reveal">
            <div className={`mxc-field${cardError ? ' has-error' : ''}`}>
              <span className="mxc-field__label" id="mxc-card-label">Card information</span>
              <div className="mxc-cardgroup" role="group" aria-labelledby="mxc-card-label">
                <span className="mxc-input-wrap">
                  <input ref={cardRef} className="mxc-input" value={card.number} onChange={setCardField('number', formatCardNumber)}
                    inputMode="numeric" autoComplete="cc-number" placeholder="Card number  ·  1234 1234 1234 1234"
                    aria-label="Card number" aria-invalid={!!errors.number} disabled={submitting} />
                  <span className={`mxc-brand${brand ? ' is-on' : ''}`} aria-hidden="true">
                    {brand ? BRAND_LABEL[brand] : <CreditCard size={18} />}
                  </span>
                </span>
                <div className="mxc-cardgroup__row">
                  <input className="mxc-input" value={card.expiry} onChange={setCardField('expiry', formatExpiry)}
                    inputMode="numeric" autoComplete="cc-exp" placeholder="Expiry · MM / YY" aria-label="Expiry date"
                    aria-invalid={!!errors.expiry} disabled={submitting} />
                  <input className="mxc-input" value={card.cvc} onChange={setCardField('cvc', (v) => digits(v).slice(0, brand === 'amex' ? 4 : 3))}
                    inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" aria-label="CVV"
                    aria-invalid={!!errors.cvc} disabled={submitting} />
                </div>
              </div>
              {cardError && <span className="mxc-field__error" role="alert">{cardError}</span>}
            </div>
            <p className="mxc-cardnote">
              {status === 'registered'
                ? 'After payment your plan is active immediately — log in with your existing password.'
                : 'After payment we create your account and email you a password to log in.'}
            </p>
          </div>
        )}

        {/* 3. Pay / Login */}
        {loginMode
          ? <a className="mx-btn mx-btn--primary mxc-submit" href={LOGIN_URL}>{buttonLabel}</a>
          : (
            <button type="submit" className="mx-btn mx-btn--primary mxc-submit"
              disabled={status === 'checking' || submitting}>
              {buttonLabel}
            </button>
          )}
      </form>

      {!loginMode && <p className="mxc-fine">
        {paid
          ? <>Auto-renews {yearly ? 'yearly' : 'monthly'} until you cancel. Payments secured by <strong>Stripe</strong>.</>
          : 'By continuing you agree to the MinuteX Terms and Privacy Policy.'}
      </p>}
      <p className="mxc-demo">
        Demo · new email = new account · <code>{api.DEMO_EMAILS.registered}</code> = registered · <code>{api.DEMO_EMAILS.subscribed}</code> = subscribed
        {paid && <> · card <code>4242 4242 4242 4242</code></>}
      </p>
    </div>
  )
}
