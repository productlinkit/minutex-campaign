import { fmtPrice, renewDate, totalDue, isPaid } from '../../data/plans'
import { Link } from '../../lib/router'
import { Check, Mail, User } from '../Icons'

const LOGIN_URL = 'https://apps.minutex.ai'

export default function SuccessStep({ plan, yearly, email, receipt, accountCreated }) {
  const paid = isPaid(plan)
  return (
    <div className="mxc-success">
      <span className="mxc-success__icon"><Check size={34} strokeWidth={3} /></span>
      <h1 className="mxc-h1">{paid ? 'Payment complete!' : 'You’re all set!'}</h1>
      <p className="mxc-muted">
        {paid
          ? `Your MinuteX ${plan.name} subscription is now active.`
          : 'Your free account is ready. Start recording on web, mobile, and in person.'}
      </p>

      {accountCreated ? (
        <div className="mxc-info mxc-info--center">
          <span className="mxc-info__icon"><Mail size={18} /></span>
          <p>We created your account and sent your login password to <strong>{email}</strong>. Check your inbox — and the spam folder, just in case.</p>
        </div>
      ) : (
        <div className="mxc-info mxc-info--center">
          <span className="mxc-info__icon"><User size={18} /></span>
          <p>The plan was added to your existing account <strong>{email}</strong>. Log in with your current password.</p>
        </div>
      )}

      <dl className="mxc-receipt">
        <div><dt>Plan</dt><dd>MinuteX {plan.name}</dd></div>
        <div><dt>Account</dt><dd>{email}</dd></div>
        {paid && <>
          <div><dt>Billing</dt><dd>{yearly ? 'Yearly' : 'Monthly'}</dd></div>
          <div><dt>Amount paid</dt><dd>{fmtPrice(totalDue(plan, yearly))} USD</dd></div>
          <div><dt>Renews on</dt><dd>{renewDate(yearly)}</dd></div>
          {receipt && <div><dt>Transaction ID</dt><dd><code>{receipt.transaction_id}</code></dd></div>}
        </>}
      </dl>

      <div className="mxc-success__actions">
        <a className="mx-btn mx-btn--primary" href={LOGIN_URL}>Log in to MinuteX</a>
        <Link className="mx-btn mx-btn--outline" to="/">Back to home</Link>
      </div>
    </div>
  )
}
