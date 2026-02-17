import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginApi, registerApi, logoutApi, getMeApi } from '../api/auth'
import { setAccessToken, getAccessToken } from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, try to restore session via refresh cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await fetch('https://chat-qqh8.onrender.com/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        }).then((r) => r.json())

        if (data?.accessToken) {
          setAccessToken(data.accessToken)
          const meRes = await getMeApi()
          setUser(meRes.data.data.user || meRes.data.data)
        }
      } catch {
        // No valid session — stay logged out
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // Listen for forced logout (token refresh failed)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null)
      setAccessToken(null)
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await loginApi(credentials)
    const { user: userData, accessToken: token } = res.data.data
    setAccessToken(token)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (userData) => {
    const res = await registerApi(userData)
    const { user: newUser, accessToken: token } = res.data.data
    setAccessToken(token)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore errors on logout
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        getToken: getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
