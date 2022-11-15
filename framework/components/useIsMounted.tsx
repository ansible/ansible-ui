import { useEffect, useState } from 'react'

export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(true)
  useEffect(
    () => () => {
      setIsMounted(false)
    },
    []
  )
  return isMounted
}
