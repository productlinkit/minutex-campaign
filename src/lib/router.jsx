import { useEffect, useState } from 'react'

/** Tiny history-API router — enough for "/" (campaign) and "/checkout". */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const href = (to) => BASE + to

export function navigate(to, { replace = false } = {}) {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', href(to))
  window.dispatchEvent(new PopStateEvent('popstate'))
  if (!replace) window.scrollTo(0, 0)
}

export function usePath() {
  const read = () => window.location.pathname.slice(BASE.length).replace(/\/$/, '') || '/'
  const [path, setPath] = useState(read)
  useEffect(() => {
    const onPop = () => setPath(read())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path
}

export function Link({ to, onClick, ...rest }) {
  return (
    <a
      href={href(to)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    />
  )
}
