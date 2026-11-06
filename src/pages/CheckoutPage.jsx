import { useEffect, useState } from 'react'
import { RAW_PLANS } from '../data/plans'
import { navigate } from '../lib/router'
import PlanStep from '../components/checkout/PlanStep'
import OrderSummary from '../components/checkout/OrderSummary'
import CheckoutForm from '../components/checkout/CheckoutForm'
import SuccessStep from '../components/checkout/SuccessStep'
import Navbar from '../components/Navbar'
import { ArrowLeft, Shield } from '../components/Icons'
import '../components/checkout/Checkout.css'

/**
 * Full-page checkout:  plan → checkout (email + card + Pay/Login) → success.
 * Accepts the same query string as apps.minutex.ai/checkout:
 *   /checkout?plan=Pro&billing=yearly&type=personal
 */
const STEPS = [
  { key: 'plan', label: 'Plan' },
  { key: 'checkout', label: 'Checkout' },
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
  const [step, setStep] = useState(initial.plan ? 'checkout' : 'plan')
  const [type, setType] = useState(initial.type)
  const [yearly, setYearly] = useState(initial.yearly)
  const [planId, setPlanId] = useState(initial.plan?.id ?? RAW_PLANS[1].id)
  const [result, setResult] = useState(null) // { email, receipt, accountCreated }

  const plan = RAW_PLANS.find((p) => p.id === planId) ?? RAW_PLANS[1]
  const stepIndex = step === 'success' ? STEPS.length : STEPS.findIndex((s) => s.key === step)

  useEffect(() => { document.title = 'Checkout · MinuteX' }, [])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [step])

  // keep the URL shareable, same params as apps.minutex.ai/checkout
  useEffect(() => {
    const q = step === 'plan'
      ? new URLSearchParams({ billing: yearly ? 'yearly' : 'monthly', type })
      : new URLSearchParams({ plan: plan.name, billing: yearly ? 'yearly' : 'monthly', type: plan.plan_type })
    navigate(`/checkout?${q}`, { replace: true })
  }, [step, yearly, type, plan.name, plan.plan_type])

  return (
    <div className="mxc-page">
      <Navbar>
        {step !== 'success' && (
          <ol className="mxc-stepper" aria-label="Checkout progress">
            {STEPS.map((s, i) => (
              <li key={s.key} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''} aria-current={i === stepIndex ? 'step' : undefined}>
                <span>{i + 1}</span>{s.label}
              </li>
            ))}
          </ol>
        )}
      </Navbar>

      <main className={`mxc-main mxc-main--${step}`} key={step}>
        {step === 'plan' && (
          <PlanStep type={type} setType={setType} yearly={yearly} setYearly={setYearly}
            onSelect={(p) => { setPlanId(p.id); setStep('checkout') }} />
        )}

        {step === 'checkout' && (
          <>
            <div className="mxc-checkout-head">
              <button type="button" className="mxc-back" onClick={() => setStep('plan')}><ArrowLeft size={16} /> Back</button>
              <h1 className="mxc-h1 mxc-h1--brand">Subscribe to MinuteX {plan.name}</h1>
            </div>
            <div className="mxc-grid">
              <OrderSummary plan={plan} yearly={yearly} setYearly={setYearly} />
              <div className="mxc-grid__main">
                <CheckoutForm plan={plan} yearly={yearly} onComplete={(r) => { setResult(r); setStep('success') }} />
              </div>
            </div>
            <p className="mxc-secure"><Shield size={14} /> Encrypted in transit and at rest · Cancel anytime</p>
          </>
        )}

        {step === 'success' && result && (
          <SuccessStep plan={plan} yearly={yearly} email={result.email} receipt={result.receipt} accountCreated={result.accountCreated} />
        )}
      </main>
    </div>
  )
}
