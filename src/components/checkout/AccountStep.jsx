import { useState } from 'react'
import { Mail } from '../Icons'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Field({ label, error, children, hint }) {
  return (
    <label className={`mxc-field${error ? ' has-error' : ''}`}>
      <span className="mxc-field__label">{label}</span>
      {children}
      {error ? <span className="mxc-field__error" role="alert">{error}</span> : hint && <span className="mxc-field__hint">{hint}</span>}
    </label>
  )
}

/** Email-only account step — the password is generated and emailed to the buyer. */
export default function AccountStep({ email, setEmail, isCompany, paid, onSubmit, loading, serverError, clearServerError }) {
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) { setError('Enter a valid email address'); return }
    onSubmit()
  }

  return (
    <div className="mxc-panel">
      <h2 className="mxc-h2">Create your account</h2>
      <p className="mxc-pill">{isCompany ? 'Company account' : 'Personal account'}</p>
      {serverError && <p className="mxc-alert" role="alert">{serverError}</p>}

      <form className="mxc-form" onSubmit={submit} noValidate>
        <Field label="Email" error={error}>
          <input className="mxc-input" type="email" value={email} autoComplete="email" autoFocus
            placeholder="name@company.com"
            onChange={(e) => { setEmail(e.target.value); setError(''); clearServerError() }} />
        </Field>

        <div className="mxc-info">
          <span className="mxc-info__icon"><Mail size={18} /></span>
          <p>No password to set up. We&rsquo;ll email you a secure password to log in once your account is created.</p>
        </div>

        <button type="submit" className="mx-btn mx-btn--primary mxc-submit" disabled={loading}>
          {loading ? <><span className="mxc-spinner" /> Please wait…</> : paid ? 'Continue to payment' : 'Create free account'}
        </button>
      </form>
      <p className="mxc-fine">By continuing you agree to the MinuteX Terms and Privacy Policy.</p>
    </div>
  )
}
