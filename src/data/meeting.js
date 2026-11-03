export const people = {
  ryan:  { name: 'Ryan',  role: 'PM',          color: '#2e6cf6', init: 'RY' },
  diana: { name: 'Diana', role: 'Design',      color: '#8b5cf6', init: 'DI' },
  ben:  { name: 'Ben',   role: 'Engineering', color: '#0ea5e9', init: 'BN' },
  sarah: { name: 'Sarah', role: 'Marketing',   color: '#f59e0b', init: 'SR' },
}

/**
 * Transcript script. `tag` marks what MinuteX detects on a line,
 * `sum` is the bullet that lands in the AI summary card.
 */
export const script = [
  { who: 'ryan',  text: "Okay, let's move on to the launch timeline. Is the 20th still realistic?" },
  { who: 'diana', text: 'Should be fine, as long as the design handoff moves up to Friday.',
    tag: { type: 'action', label: 'Task · Diana · Friday' }, sum: 'Diana delivers design handoff on Friday' },
  { who: 'ben',  text: 'Engineering needs two days for QA, so code freeze by the 17th at the latest.',
    tag: { type: 'deadline', label: 'Deadline · Nov 17' }, sum: 'Code freeze no later than Nov 17' },
  { who: 'sarah', text: "Then campaign assets need to be ready before that. I'll draft them this week.",
    tag: { type: 'action', label: 'Task · Sarah · This week' }, sum: 'Sarah drafts the campaign assets' },
  { who: 'ryan',  text: 'Great. So we agree the launch stays on the 20th?' },
  { who: 'ben',  text: "Agreed. I'll update the board so everyone can follow along.",
    tag: { type: 'decision', label: 'Decision · Launch Nov 20' }, sum: 'Agreed: launch stays on Nov 20' },
]

export const MEETING_START_SECS = 12 * 60 + 4
