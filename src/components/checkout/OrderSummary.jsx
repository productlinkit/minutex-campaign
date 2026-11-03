import { checkoutLimits, fmtPrice, renewDate, savePercent, totalDue, isPaid } from '../../data/plans'
import { Check } from '../Icons'

function CycleOption({ active, onClick, title, badge, price, sub, disabled }) {
  return (
    <button type="button" role="radio" aria-checked={active} disabled={disabled}
      className={`mxc-cycle${active ? ' is-active' : ''}`} onClick={onClick}>
      <span className="mxc-cycle__top">
        <span className="mxc-radio" aria-hidden="true" />
        <span className="mxc-cycle__title">{title}</span>
        {badge && <span className="mxc-save">{badge}</span>}
      </span>
      <span className="mxc-cycle__price"><strong>{price}</strong> /mo</span>
      <span className="mxc-cycle__sub">{sub}</span>
    </button>
  )
}

export default function OrderSummary({ plan, yearly, setYearly, locked }) {
  const paid = isPaid(plan)
  const rate = yearly ? plan.price_yearly : plan.price_monthly
  const total = totalDue(plan, yearly)
  const save = savePercent(plan)
  const perUser = plan.plan_type === 'company'

  return (
    <section className="mxc-summary" aria-label="Order summary">
      <h2 className="mxc-h2">Order summary</h2>

      {paid && (
        <>
          <p className="mxc-label">Billing Cycle</p>
          <div className="mxc-cycles" role="radiogroup" aria-label="Billing cycle">
            <CycleOption active={yearly} disabled={locked} onClick={() => setYearly(true)} title="Yearly"
              badge={save ? `save ${save}%` : undefined} price={fmtPrice(plan.price_yearly)}
              sub={`billed ${fmtPrice(plan.price_yearly * 12)} yearly`} />
            <CycleOption active={!yearly} disabled={locked} onClick={() => setYearly(false)} title="Monthly"
              price={fmtPrice(plan.price_monthly)} sub={`billed ${fmtPrice(plan.price_monthly)} monthly`} />
          </div>
        </>
      )}

      <p className="mxc-label">Plan</p>
      <div className="mxc-row">
        <span>MinuteX {plan.name} · {fmtPrice(rate)}/mo{perUser && paid ? ' per user' : ''}</span>
        <strong>{fmtPrice(total)}</strong>
      </div>

      <p className="mxc-label">What you get</p>
      <dl className="mxc-limits">
        {checkoutLimits(plan).map((r) => (
          <div key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>
        ))}
      </dl>

      <ul className="mxc-features">
        {plan.features.slice(0, 8).map((f) => <li key={f}><Check size={14} strokeWidth={2.6} />{f}</li>)}
      </ul>

      <div className="mxc-total">
        <div className="mxc-row mxc-row--total"><span>Total</span><strong>{fmtPrice(total)}</strong></div>
        <div className="mxc-row mxc-row--sub">
          <span>{paid ? `Auto renews on ${renewDate(yearly)}` : 'Free forever'}</span>
          <span>{paid ? (yearly ? 'per year' : 'per month') : ''}</span>
        </div>
      </div>
    </section>
  )
}
