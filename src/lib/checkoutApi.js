/**
 * Mock checkout API — nothing leaves the browser.
 *
 * Flow: the buyer only gives an email. The backend creates the account,
 * generates a password and emails it, then the subscription is paid.
 *
 * To go live, swap each function body for the real call:
 *   register   → POST /auth/register   { email, account_type, language }
 *                ⚠ the current MinuteX API requires full_name + password here;
 *                  an "email-only, password sent by email" variant must be added server-side.
 *   subscribe  → POST /stripe/subscribe { payment_method_id, plan_id, period }
 *                (payment_method_id comes from Stripe Elements — raw card numbers
 *                 must never be sent to MinuteX servers.)
 */

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export async function register({ email }) {
  await wait(900)
  if (email.toLowerCase().startsWith('taken@')) throw new Error('This email is already registered.')
  return { email, password_sent: true }
}

export async function subscribe({ plan_id, period, card }) {
  await wait(1600)
  // Stripe's well-known decline test card
  if (card.number === '4000000000000002') throw new Error('Your card was declined.')
  return {
    status: 'paid',
    transaction_id: 'trx_' + Math.random().toString(36).slice(2, 10),
    plan_id,
    period,
  }
}
