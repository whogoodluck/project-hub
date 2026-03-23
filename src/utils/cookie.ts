import { Response } from 'express'

const COOKIE_NAME = 'refresh_token'
const ACCESS_COOKIE_NAME = 'access_token'

const SHARED_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    ...SHARED_OPTIONS,
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function setAccessCookie(res: Response, token: string) {
  res.cookie(ACCESS_COOKIE_NAME, token, {
    ...SHARED_OPTIONS,
    path: '/',
    maxAge: 15 * 60 * 1000,
  })
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { ...SHARED_OPTIONS, path: '/api/v1/auth' })
}

export function clearAccessCookie(res: Response) {
  res.clearCookie(ACCESS_COOKIE_NAME, { ...SHARED_OPTIONS, path: '/' })
}

export const REFRESH_COOKIE_NAME = COOKIE_NAME
export const ACCESS_COOKIE_NAME_KEY = ACCESS_COOKIE_NAME
