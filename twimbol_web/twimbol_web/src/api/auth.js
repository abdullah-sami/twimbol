import api from './axios'

export const login = (username, password) =>
  api.post('/user/login/', { username, password })

export const register = (data) =>
  api.post('/user/api/register/', data)

export const forgotPassword = (email) =>
  api.post('/user/forgot-password/', { email })

export const resetPassword = (email, code, new_password) =>
  api.post('/user/reset-password-confirm/', { email, code, new_password })