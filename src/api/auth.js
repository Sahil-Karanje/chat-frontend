import api from './axios'

export const loginApi = (credentials) =>
  api.post('/api/auth/login', credentials)

export const registerApi = (userData) =>
  api.post('/api/auth/register', userData)

export const logoutApi = () =>
  api.post('/api/auth/logout')

export const getMeApi = () =>
  api.get('/api/auth/me')
