import { plansForType, toCard, fmtPrice, SUPPORT_URL } from '../../data/plans'
import { Check, User, Building } from '../Icons'

const TYPES = [
  { key: 'personal', title: 'Personal', desc: 'For one person — sign up, pay, and start recording instantly.', Icon: User },
  { key: 'company', title: 'Company', desc: 'Billed per seat — invite members, share workspaces, manage everyone from one account.', Icon: Building },
]

export default function PlanStep({ type, setType, yearly, setYearly, onSelect }) {
  const plans = plansForType(type)

  return (
    <div className="mxc-plan">
      <div className="mxc-plan__intro">
        <p className="mx-eyebrow">Pricing</p>
        <h2 className="mxc-h1">Find the plan that fits the way you meet</h2>
        <p className="mxc-muted">Start free, upgrade when you need more. Every plan captures your conversations automatically — on web, mobile, and in person.</p>
      </div>

      <p className="mxc-steplabel"><span>1</span>Choose your plan type</p>
      <div className="mxc-types" role="radiogroup" aria-label="Plan type">
        {TYPES.map(({ key, title, desc, Icon }) => (
          <button
            key={key} type="button" role="radio" aria-checked={type === key}
            className={`mxc-type${type === key ? ' is-active' : ''}`}
            onClick={() => setType(key)}
          >
            <span className="mxc-type__icon"><Icon size={18} /></span>
            <span>
              <span className="mxc-type__title">{title}<span className="mxc-radio" aria-hidden="true" /></span>
              <span className="mxc-type__desc">{desc}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="mxc-steplabel"><span>2</span>Pick your billing</p>
      <div className="mxc-billing" role="radiogroup" aria-label="Billing period">
        <button type="button" role="radio" aria-checked={!yearly} className={!yearly ? 'is-active' : ''} onClick={() => setYearly(false)}>Monthly</button>
        <button type="button" role="radio" aria-checked={yearly} className={yearly ? 'is-active' : ''} onClick={() => setYearly(true)}>
          Yearly <span className="mxc-save">Save 20%</span>
        </button>
      </div>

      <div className={`mxc-cards mxc-cards--${plans.length}`}>
        {plans.map((plan) => {
          const card = toCard(plan)
          const price = yearly ? plan.price_yearly : plan.price_monthly
          return (
            <article key={plan.id} className={`mxc-pcard${plan.is_popular ? ' is-popular' : ''}`}>
              {card.badge && <span className="mxc-pcard__badge">{card.badge}</span>}
              <h3>{plan.name}</h3>
              <p className="mxc-pcard__desc">{card.desc}</p>
              <p className="mxc-pcard__price">
                <strong>{price > 0 ? fmtPrice(price) : '$0'}</strong>
                <span>{card.period}</span>
                {yearly && price > 0 && <em className="mxc-save">Save 20%</em>}
              </p>
              <p className="mxc-pcard__note">{price > 0 && (yearly ? card.note : `billed monthly${plan.plan_type === 'company' ? ', per user' : ''}`)}</p>

              <button type="button" className={`mx-btn ${plan.is_popular ? 'mx-btn--primary' : 'mx-btn--outline'} mxc-pcard__cta`} onClick={() => onSelect(plan)}>
                {card.cta}
              </button>

              <dl className="mxc-pcard__limits">
                {card.limits.map((l) => (
                  <div key={l.label}><dt>{l.label}</dt><dd>{l.value}</dd></div>
                ))}
              </dl>
              <ul className="mxc-pcard__features">
                {plan.features.map((f) => <li key={f}><Check size={14} strokeWidth={2.6} />{f}</li>)}
              </ul>
            </article>
          )
        })}
      </div>

      <div className="mxc-enterprise">
        <div>
          <h3>Enterprise</h3>
          <p>Custom volume, security reviews, onboarding, and a dedicated success manager for large teams.</p>
        </div>
        <a className="mx-btn mx-btn--outline" href={SUPPORT_URL}>Contact sales</a>
      </div>
    </div>
  )
}
