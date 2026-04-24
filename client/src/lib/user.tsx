import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from './api'
import type { UserName } from './types'

interface UserContextType {
  userName: UserName | null
  loading: boolean
  login: (name: UserName, password: string) => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType>(null!)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<UserName | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me()
      .then(({ userName }) => setUserName(userName))
      .catch(() => setUserName(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (name: UserName, password: string) => {
    await api.login(name, password)
    setUserName(name)
  }

  const logout = async () => {
    await api.logout()
    setUserName(null)
  }

  return (
    <UserContext.Provider value={{ userName, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
