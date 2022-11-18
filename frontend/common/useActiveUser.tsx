import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useGet } from '../common/useItem'
import { User } from '../controller/interfaces/User'

const ActiveUserContext = createContext<User | null | undefined>(undefined)

/**
 * Get the active logged in user
 * @returns undefined while querying the user, null if user not found, otherwise the User.
 */
export function useActiveUser() {
  return useContext(ActiveUserContext)
}

export function ActiveUserProvider(props: { children?: ReactNode }) {
  const [activeUser, setActiveUser] = useState<User | null | undefined>(undefined)
  const userResponse = useGet<User>('/api/v2/me/')
  useEffect(() => setActiveUser(userResponse.data ?? null), [userResponse.data])
  return (
    <ActiveUserContext.Provider value={activeUser}>{props.children}</ActiveUserContext.Provider>
  )
}
