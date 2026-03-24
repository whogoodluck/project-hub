import api from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER'
}

export interface SignupPayload {
  name: string
  email: string
  password: string
}

export interface SigninPayload {
  email: string
  password: string
}

export async function signupApi(data: SignupPayload): Promise<User> {
  const res = await api.post('/auth/signup', data)
  return res.data.data
}

export async function signinApi(data: SigninPayload): Promise<{ user: User }> {
  const res = await api.post('/auth/signin', data)
  return res.data.data
}

export async function signoutApi(): Promise<void> {
  await api.post('/auth/signout')
}

export async function getMeApi(): Promise<User | null> {
  try {
    const res = await api.get('/auth/me')
    return res.data.data
  } catch {
    return null
  }
}