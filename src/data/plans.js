/**
 * Snapshot of https://minutex.ai/api/plans (fetched 2026-11-03).
 * The live endpoint has no CORS headers, so it can't be called from this
 * campaign's origin — refresh this snapshot (or proxy the endpoint) when prices change.
 */
export const RAW_PLANS = [
  {
    id: 'c7b9f456-6e27-4531-b262-99dfbfe17cee', name: 'Free', plan_type: 'personal',
    price_monthly: 0, price_yearly: 0,
    max_recording_hours: 10, max_ai_summaries: 50, max_storage_gb: 20,
    max_users: 0, max_teams: 0, max_meetings: 0, max_meeting_minutes: 0,
    is_popular: false, sort_order: 1,
    features: ['Up to 10 recording hours/month', 'Basic AI summaries', '5GB cloud storage', 'Email support'],
  },
  {
    id: '618cfdc9-c975-4d4c-a27f-a17435e208f3', name: 'Pro', plan_type: 'personal',
    price_monthly: 12, price_yearly: 9.6,
    max_recording_hours: 1500, max_ai_summaries: 9999, max_storage_gb: 100,
    max_users: 0, max_teams: 0, max_meetings: 0, max_meeting_minutes: 240,
    is_popular: true, sort_order: 2,
    features: ['1500 recording hours/month', 'Advanced AI summaries', '100GB cloud storage', 'Priority support', 'Custom templates', 'Team collaboration', 'Up to 4 Hours / Meeting'],
  },
  {
    id: '6e146be7-e58f-4cf2-a853-3dc9a3b93a34', name: 'Business', plan_type: 'personal',
    price_monthly: 40, price_yearly: 32,
    max_recording_hours: 9999, max_ai_summaries: 9999, max_storage_gb: 1000,
    max_users: 0, max_teams: 0, max_meetings: 0, max_meeting_minutes: 360,
    is_popular: false, sort_order: 3,
    features: ['Unlimited recording hours', 'Unlimited AI summaries', '1TB cloud storage', '24/7 dedicated support', 'Custom integrations', 'Team collaboration', 'Advanced analytics', 'Up to 6 hours/meeting'],
  },
  {
    id: '8b88dbb4-cd42-4a2d-b7fa-e2c357922ca8', name: 'Team', plan_type: 'company',
    price_monthly: 7, price_yearly: 5.6,
    max_recording_hours: 500, max_ai_summaries: 0, max_storage_gb: 1000,
    max_users: 7, max_teams: 3, max_meetings: 0, max_meeting_minutes: 0,
    is_popular: true, sort_order: 2,
    features: ['500 recording hours/month', 'Advanced AI summaries', '1TB shared storage', 'Up to 7 members', 'Up to 3 teams', 'Priority support', 'Shared team workspace'],
  },
  {
    id: '125e7937-f7d2-402a-b759-cd5b80abe855', name: 'Business', plan_type: 'company',
    price_monthly: 14, price_yearly: 12,
    max_recording_hours: 0, max_ai_summaries: 0, max_storage_gb: 2000,
    max_users: 10, max_teams: 5, max_meetings: 0, max_meeting_minutes: 0,
    is_popular: false, sort_order: 3,
    features: ['Unlimited recording hours', 'Unlimited AI summaries', '2TB shared storage', 'Up to 10 members', 'Up to 50 teams', '24/7 dedicated support', 'SSO / SAML', 'Advanced security & analytics'],
  },
]

export const SUPPORT_URL = 'mailto:support@linkit360.ai'

const unlimited = (n) => !n || n <= 0 || n >= 9999
const fmtCount = (n) => (unlimited(n) ? 'Unlimited' : n.toLocaleString('en-US'))

/** "$9.6" style — same formatter as the MinuteX app (no forced decimals). */
export const fmtPrice = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

export const plansForType = (type) =>
  RAW_PLANS.filter((p) => p.plan_type === type).sort((a, b) => a.price_monthly - b.price_monthly)

export const isPaid = (plan) => plan.price_monthly > 0

/** Pricing-card view model — mirrors the minutex.ai/pricing mapping. */
export function toCard(plan) {
  const paid = isPaid(plan)
  const company = plan.plan_type === 'company'
  const limits = [
    { label: 'Recording', value: unlimited(plan.max_recording_hours) ? 'Unlimited' : `${plan.max_recording_hours} hrs/mo` },
    { label: 'AI summaries', value: unlimited(plan.max_ai_summaries) ? 'Unlimited' : `${plan.max_ai_summaries}/mo` },
    { label: 'Storage', value: `${fmtCount(plan.max_storage_gb)} GB` },
  ]
  if (company) {
    limits.push({ label: 'Members', value: fmtCount(plan.max_users) })
    limits.push({ label: 'Teams', value: fmtCount(plan.max_teams) })
  }
  return {
    desc: company ? 'For teams & organisations' : paid ? 'For power users' : 'For trying things out',
    period: paid ? (company ? '/user/month' : '/month') : 'forever',
    note: paid ? (company ? 'per user, billed yearly' : 'per month, billed yearly') : undefined,
    cta: paid ? 'Buy Now' : 'Get started',
    badge: plan.is_popular ? 'Most popular' : undefined,
    limits,
  }
}

/** "What you get" rows on the checkout order summary — mirrors apps.minutex.ai/checkout. */
export function checkoutLimits(plan) {
  const rows = [
    { label: 'Recording', value: unlimited(plan.max_recording_hours) ? 'Unlimited' : `${plan.max_recording_hours} hrs/mo` },
    { label: 'AI summaries', value: unlimited(plan.max_ai_summaries) ? 'Unlimited' : `${plan.max_ai_summaries}/mo` },
    { label: 'Cloud storage', value: unlimited(plan.max_storage_gb) ? 'Unlimited' : `${plan.max_storage_gb} GB` },
    { label: 'Meetings', value: !plan.max_meetings || plan.max_meetings <= 0 ? 'Unlimited' : `${plan.max_meetings}/mo` },
    { label: 'Meeting length', value: !plan.max_meeting_minutes || plan.max_meeting_minutes <= 0 ? 'Unlimited' : `${plan.max_meeting_minutes} min` },
  ]
  if (plan.plan_type === 'company') {
    rows.push({ label: 'Members', value: !plan.max_users || plan.max_users <= 0 ? 'Unlimited' : `${plan.max_users}` })
    rows.push({ label: 'Teams', value: !plan.max_teams || plan.max_teams <= 0 ? 'Unlimited' : `${plan.max_teams}` })
  }
  return rows
}

export const savePercent = (plan) =>
  plan.price_monthly > 0 && plan.price_yearly
    ? Math.max(0, Math.round((1 - plan.price_yearly / plan.price_monthly) * 100))
    : 0

/** Amount charged now: yearly is billed as 12 × the yearly monthly rate. */
export const totalDue = (plan, yearly) => (yearly ? plan.price_yearly * 12 : plan.price_monthly)

export function renewDate(yearly) {
  const d = new Date()
  yearly ? d.setFullYear(d.getFullYear() + 1) : d.setMonth(d.getMonth() + 1)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
