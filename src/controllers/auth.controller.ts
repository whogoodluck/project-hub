import { Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import * as authService from '../services/auth.service'
import {
  clearAccessCookie,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
  setAccessCookie,
  setRefreshCookie,
} from '../utils/cookie'

export async function signup(req: Request, res: Response) {
  const user = await authService.signup(req.body)
  res.status(201).json({ success: true, data: user })
}

export async function signin(req: Request, res: Response) {
  const { accessToken, rawRefresh, user } = await authService.signin(req.body)
  setAccessCookie(res, accessToken)
  setRefreshCookie(res, rawRefresh)
  res.status(200).json({ success: true, data: { user } })
}

export async function refresh(req: Request, res: Response) {
  const token: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME]

  if (!token) {
    throw new AppError(401, 'No refresh token', 'MISSING_REFRESH_TOKEN')
  }

  const { accessToken, rawRefresh } = await authService.refreshTokens(token)
  setAccessCookie(res, accessToken)
  setRefreshCookie(res, rawRefresh)
  res.status(200).json({ success: true })
}

export async function signout(req: Request, res: Response) {
  const token: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME]
  if (token) await authService.signout(token)
  clearAccessCookie(res)
  clearRefreshCookie(res)
  res.status(200).json({ success: true, message: 'Signed out successfully' })
}

export async function me(req: Request, res: Response) {
  res.status(200).json({ success: true, data: req.user })
}
