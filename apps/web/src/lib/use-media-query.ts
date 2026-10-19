import { useEffect, useState } from 'react'

/**
 * Subscribes to a CSS media query so layout decisions that need focus
 * management (for example, making a closed drawer inert) can follow the
 * same breakpoint as the stylesheet.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const update = () => setMatches(mediaQueryList.matches)

    update()
    mediaQueryList.addEventListener('change', update)

    return () => mediaQueryList.removeEventListener('change', update)
  }, [query])

  return matches
}
