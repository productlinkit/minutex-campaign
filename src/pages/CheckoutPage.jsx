import { useEffect, useState } from 'react'
import { RAW_PLANS, isPaid } from '../data/plans'
import * as api from '../lib/checkoutApi'
import { navigate } from '../lib/router'
import PlanStep from '../components/checkout/PlanStep'
import OrderSummary from '../components/checkout/OrderSummary'
import AccountStep from '../components/checkout/AccountStep'
import PaymentStep from '../components/checkout/PaymentStep'
import SuccessStep from '../components/checkout/SuccessStep'
import { ArrowLeft, Shield } from '../components/Icons'
import Navbar from '../components/Navbar'
import '../components/checkout/Checkout.css'

/**
 * Full-page checkout. Mirrors minutex.ai/pricing → apps.minutex.ai/checkout:
 *   plan (type + billing + plan card) → email → payment → success
 * Free plans skip payment. Accepts the same query string as the real app:
 *   /checkout?plan=Pro&billing=yearly&type=personal
 */
const STEPS = [
  { key: 'plan', label: 'Plan' },
  { key: 'account', label: 'Email' },
  { key: 'payment', label: 'Payment' },
]

function readQuery() {
  const q = new URLSearchParams(window.location.search)
  const type = q.get('type') === 'company' ? 'company' : 'personal'
  const name = (q.get('plan') || '').toLowerCase()
  const plan = RAW_PLANS.find((p) => p.plan_type === type && p.name.toLowerCase() === name)
  return { type, yearly: q.get('billing') !== 'monthly', plan }
}

export default function CheckoutPage() {
  const [initial] = useState(readQuery)
  const [step, setStep] = useState(initial.plan ? 'account' : 'plan')
  const [type, setType] = useState(initial.type)
  const [yearly, setYearly] = useState(initial.yearly)
  const [planId, setPlanId] = useState(initial.plan?.id ?? RAW_PLANS[1].id)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)

  const plan = RAW_PLANS.find((p) => p.id === planId) ?? RAW_PLANS[1]
  const paid = isPaid(plan)
  const isCompany = plan.plan_type === 'company'
  const steps = paid ? STEPS : STEPS.filter((s) => s.key !== 'payment')
  const stepIndex = step === 'success' ? steps.length : steps.findIndex((s) => s.key === step)

  useEffect(() => { document.title = 'Checkout · MinuteX' }, [])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [step])

  // keep the URL shareable, same params as apps.minutex.ai/checkout
  useEffect(() => {
    const q = step === 'plan'
      ? new URLSearchParams({ billing: yearly ? 'yearly' : 'monthly', type })
      : new URLSearchParams({ plan: plan.name, billing: yearly ? 'yearly' : 'monthly', type: plan.plan_type })
    navigate(`/checkout?${q}`, { replace: true })
  }, [step, yearly, type, plan.name, plan.plan_type])

  const run = async (fn) => {
    setLoading(true); setError('')
    try { await fn() } catch (err) { setError(err.message || 'Something went wrong. Please try again.') } finally { setLoading(false) }
  }
  const go = (key) => { setError(''); setStep(key) }

  const handleSelectPlan = (p) => { setPlanId(p.id); go('account') }

  const handleAccount = () => run(async () => {
    await api.register({ email: email.trim(), account_type: isCompany ? 'company' : 'personal', language: 'en' })
    go(paid ? 'payment' : 'success')
  })

  const handlePay = (card) => run(async () => {
    const res = await api.subscribe({ plan_id: plan.id, period: yearly ? 'yearly' : 'monthly', card })
    setReceipt(res)
    go('success')
  })

  const back = () => go(step === 'payment' ? 'account' : 'plan')
  const inCheckout = step === 'account' || step === 'payment'

  return (
    <div className="mxc-page">
      <Navbar>
        {step !== 'success' && (
          <ol className="mxc-stepper" aria-label="Checkout progress">
            {steps.map((s, i) => (
              <li key={s.key} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''} aria-current={i === stepIndex ? 'step' : undefined}>
                <span>{i + 1}</span>{s.label}
              </li>
            ))}
          </ol>
        )}
      </Navbar>

      <main className={`mxc-main mxc-main--${step}`} key={step}>
        {step === 'plan' && (
          <PlanStep type={type} setType={setType} yearly={yearly} setYearly={setYearly} onSelect={handleSelectPlan} />
        )}

        {inCheckout && (
          <>
            <div className="mxc-checkout-head">
              <button type="button" className="mxc-back" onClick={back} disabled={loading}><ArrowLeft size={16} /> Back</button>
              <h1 className="mxc-h1 mxc-h1--brand">Subscribe to MinuteX {plan.name}</h1>
            </div>
            <div className="mxc-grid">
              <OrderSummary plan={plan} yearly={yearly} setYearly={setYearly} locked={loading} />
              <div className="mxc-grid__main">
                {step === 'account' && (
                  <AccountStep email={email} setEmail={setEmail} isCompany={isCompany} paid={paid}
                    onSubmit={handleAccount} loading={loading} serverError={error} clearServerError={() => setError('')} />
                )}
                {step === 'payment' && (
                  <PaymentStep plan={plan} yearly={yearly} email={email.trim()} onPay={handlePay}
                    onChangeEmail={() => go('account')} loading={loading} serverError={error} />
                )}
              </div>
            </div>
            <p className="mxc-secure"><Shield size={14} /> Encrypted in transit and at rest · Cancel anytime</p>
          </>
        )}

        {step === 'success' && <SuccessStep plan={plan} yearly={yearly} email={email.trim()} receipt={receipt} />}
      </main>
    </div>
  )
}
