import { useCallback } from 'react'

export function usePageNavigate() {
  const navigate = useCallback((to?: string) => {
    if (to?.startsWith('http')) {
      open(to, '_blank')
    } else {
      open(to, '_self')
    }
  }, [])
  return navigate
}
