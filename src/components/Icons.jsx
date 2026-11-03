const base = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

export const ArrowRight = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

export const Check = ({ size = 16, strokeWidth = 2.4 }) => (
  <svg {...base} width={size} height={size} strokeWidth={strokeWidth}><path d="M20 6 9 17l-5-5" /></svg>
)

export const Video = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} strokeWidth={2}>
    <path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
)

export const Sparkle = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} strokeWidth={2}>
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
  </svg>
)

const icon = (paths, sw = 2) => function Icon({ size = 18, strokeWidth = sw, ...rest }) {
  return <svg {...base} width={size} height={size} strokeWidth={strokeWidth} {...rest}>{paths}</svg>
}

export const Close = icon(<path d="M18 6 6 18M6 6l12 12" />)
export const ArrowLeft = icon(<path d="M19 12H5M11 18l-6-6 6-6" />)
export const Lock = icon(<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>)
export const Mail = icon(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>)
export const User = icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>)
export const Building = icon(<><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" /></>)
export const Eye = icon(<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>)
export const EyeOff = icon(<><path d="M10.7 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6A16.7 16.7 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>)
export const CreditCard = icon(<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>)
export const Shield = icon(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />)
