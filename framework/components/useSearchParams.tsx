import { useCallback, useMemo } from 'react'
import { useWindowLocation } from './useWindowLocation'

export function useSearchParams(): [URLSearchParams, (setSearchParams: URLSearchParams) => void] {
  const location = useWindowLocation()
  const pathname = location.location?.pathname || '/'
  const searchParams = useMemo<URLSearchParams>(
    () => new URLSearchParams(location.location?.search ?? '/'),
    [location.location?.search]
  )
  const setSearchParams = useCallback(
    (searchParams: URLSearchParams) => {
      const newSearch = searchParams.toString()
      if (newSearch) location.update('?' + newSearch)
      else location.update(pathname) // retain the existing pathname
    },
    [location, pathname]
  )
  return [searchParams, setSearchParams]
}
