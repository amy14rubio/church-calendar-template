import { useEffect } from 'react'

// Freezes the page behind a modal — locks both <html> and <body> (browsers
// disagree on which is the actual scrolling element, so both are set to be
// safe). The modal's own inner panel needs its own separate
// `overflow-y-auto` container to stay scrollable — this hook only ever
// touches the page behind it.
export function useModalScrollLock(): void {
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overflow = originalBodyOverflow
    }
  }, [])
}
