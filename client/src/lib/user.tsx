import { createContext, useContext, useState, ReactNode } from 'react'
import type { UserName } from './types'

interface UserContextType {
  userName: UserName | null
  setUser: (name: UserName) => void
  clearUser: () => void
}

const UserContext = createContext<UserContextType>(null!)

const COOKIE_NAME = 'taskHim_user'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function readCookie(): UserName | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  const val = match ? decodeURIComponent(match[1]) : null
  return val === 'Dave' || val === 'Anna' ? val : null
}

function writeCookie(name: UserName) {
  document.cookie = `${COOKIE_NAME}=${name}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`
}

function deleteCookie() {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<UserName | null>(readCookie)

  const setUser = (name: UserName) => {
    writeCookie(name)
    setUserName(name)
  }

  const clearUser = () => {
    deleteCookie()
    setUserName(null)
  }

  return (
    <UserContext.Provider value={{ userName, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
