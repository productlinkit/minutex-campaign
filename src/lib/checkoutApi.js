/**
 * Mock checkout API — nothing leaves the browser.
 *
 * Checkout flow (single page: email + card + Pay/Login):
 *   1. checkEmail  → which of the 3 cases applies
 *        new         → card form shown → pay → account auto-created, password generated & emailed
 *        registered  → card form shown → pay → subscription activated (keeps existing password)
 *        subscribed  → card form hidden → login offer, button becomes "Login"
 *   2. subscribe   → charge + create/activate in one call
 *
 * To go live, swap each function body for the real call. These endpoints do not
 * exist in the current MinuteX API (api.minutex.ai/api/v1) and must be added server-side:
 *   checkEmail → GET  /checkout/email-status?email=…
 *                → { exists: boolean, subscribed: boolean, current_plan?, billing_cycle? }
 *   subscribe  → POST /checkout/subscribe
 *                { email, plan_id, period, payment_method_id }
 *                → { status, transaction_id, account_created, password_sent }
 *   register   → POST /checkout/register-free { email }   (free plan, no card)
 * payment_method_id comes from Stripe Elements — raw card numbers must never be
 * sent to MinuteX servers. checkEmail should be rate-limited server-side, since it
 * reveals whether an email has an account.
 */

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/** Demo emails that trigger each case (any other valid email = new account). */
export const DEMO_EMAILS = {
  registered: 'member@example.com',
  subscribed: 'pro@example.com',
}

export async function checkEmail({ email }) {
  await wait(700)
  const e = email.toLowerCase()
  if (e === DEMO_EMAILS.subscribed) return { exists: true, subscribed: true, current_plan: 'Pro', billing_cycle: 'yearly' }
  if (e === DEMO_EMAILS.registered) return { exists: true, subscribed: false }
  return { exists: false, subscribed: false }
}

export async function subscribe({ email, plan_id, period, card }) {
  await wait(1600)
  // Stripe's well-known decline test card
  if (card.number === '4000000000000002') throw new Error('Your card was declined.')
  const { exists } = await checkEmail({ email })
  return {
    status: 'paid',
    transaction_id: 'trx_' + Math.random().toString(36).slice(2, 10),
    plan_id,
    period,
    account_created: !exists,
    password_sent: !exists,
  }
}

export async function registerFree({ email }) {
  await wait(900)
  return { account_created: true, password_sent: true, email }
}
