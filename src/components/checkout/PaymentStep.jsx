import { useState } from 'react'
import { fmtPrice, totalDue } from '../../data/plans'
import { cardBrand, digits, formatCardNumber, formatExpiry, validateCard } from '../../lib/card'
import { Field } from './AccountStep'
import { CreditCard, Lock } from '../Icons'

const COUNTRIES = ['Indonesia', 'Singapore', 'Malaysia', 'Australia', 'United Kingdom', 'United States', 'Other']
const BRAND_LABEL = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC' }

/**
 * NOTE: UI-only card form for the campaign prototype. In production, replace the
 * three card inputs with Stripe's <PaymentElement /> (or redirect to the Stripe-hosted
 * checkout, as apps.minutex.ai does) so card data never touches MinuteX servers.
 */
export default function PaymentStep({ plan, yearly, email, onPay, onChangeEmail, loading, serverError }) {
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '', country: 'Indonesia', zip: '' })
  const [errors, setErrors] = useState({})
  const brand = cardBrand(card.number)
  const total = totalDue(plan, yearly)

  const set = (k, fmt = (v) => v) => (e) => {
    setCard((c) => ({ ...c, [k]: fmt(e.target.value) }))
    setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
    const err = validateCard(card)
    if (card.country === 'United States' && digits(card.zip).length < 5) err.zip = 'Your ZIP is incomplete.'
    setErrors(err)
    if (!Object.keys(err).length) onPay({ ...card, number: digits(card.number) })
  }
  const cardError = errors.number || errors.expiry || errors.cvc

  return (
    <div className="mxc-panel">
      <h2 className="mxc-h2">Payment</h2>
      <p className="mxc-muted">Complete your subscription to MinuteX {plan.name}. Your plan is active the moment payment settles.</p>

      <div className="mxc-recap">
        <div className="mxc-row"><span>Plan</span><strong>MinuteX {plan.name}</strong></div>
        <div className="mxc-row"><span>Billing</span><span>{yearly ? 'Yearly' : 'Monthly'}</span></div>
        <div className="mxc-row"><span>Total</span><strong>{fmtPrice(total)}</strong></div>
      </div>

      {serverError && <p className="mxc-alert" role="alert">{serverError}</p>}

      <form className="mxc-form" onSubmit={submit} noValidate>
        <Field label="Email" hint={<>Your password will be sent here. <button type="button" className="mxc-link" onClick={onChangeEmail}>Change email</button></>}>
          <input className="mxc-input" type="email" value={email} readOnly aria-readonly="true" />
        </Field>

        <div className={`mxc-field${cardError ? ' has-error' : ''}`}>
          <span className="mxc-field__label" id="mxc-card-label">Card information</span>
          <div className="mxc-cardgroup" role="group" aria-labelledby="mxc-card-label">
            <span className="mxc-input-wrap">
              <input className="mxc-input" value={card.number} onChange={set('number', formatCardNumber)}
                inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234"
                aria-label="Card number" aria-invalid={!!errors.number} autoFocus />
              <span className={`mxc-brand${brand ? ' is-on' : ''}`} aria-hidden="true">
                {brand ? BRAND_LABEL[brand] : <CreditCard size={18} />}
              </span>
            </span>
            <div className="mxc-cardgroup__row">
              <input className="mxc-input" value={card.expiry} onChange={set('expiry', formatExpiry)}
                inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" aria-label="Expiration date" aria-invalid={!!errors.expiry} />
              <input className="mxc-input" value={card.cvc} onChange={set('cvc', (v) => digits(v).slice(0, brand === 'amex' ? 4 : 3))}
                inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" aria-label="Security code" aria-invalid={!!errors.cvc} />
            </div>
          </div>
          {cardError && <span className="mxc-field__error" role="alert">{cardError}</span>}
        </div>

        <Field label="Name on card" error={errors.name}>
          <input className="mxc-input" value={card.name} onChange={set('name')} autoComplete="cc-name" placeholder="Full name on card" />
        </Field>

        <div className="mxc-split">
          <Field label="Country or region">
            <select className="mxc-input" value={card.country} onChange={set('country')} autoComplete="country-name">
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          {card.country === 'United States' && (
            <Field label="ZIP" error={errors.zip}>
              <input className="mxc-input" value={card.zip} onChange={set('zip', (v) => digits(v).slice(0, 5))} inputMode="numeric" autoComplete="postal-code" placeholder="12345" />
            </Field>
          )}
        </div>

        <button type="submit" className="mx-btn mx-btn--primary mxc-submit" disabled={loading}>
          {loading ? <><span className="mxc-spinner" /> Processing…</> : <><Lock size={16} /> Pay {fmtPrice(total)}</>}
        </button>
      </form>

      <p className="mxc-fine">
        By subscribing you agree to auto-renew {yearly ? 'yearly' : 'monthly'} until you cancel. Payments secured by <strong>Stripe</strong>.
      </p>
      <p className="mxc-demo">Demo mode · test card <code>4242 4242 4242 4242</code>, any future date &amp; CVC</p>
    </div>
  )
}
