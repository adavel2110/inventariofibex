import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/profile')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token } = res.data
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    const profileRes = await api.get('/auth/profile')
    setUser(profileRes.data)
    return profileRes.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
