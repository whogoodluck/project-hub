import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import { ACCESS_COOKIE_NAME_KEY } from '../utils/cookie'
import { verifyAccessToken } from '../utils/jwt'

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token: string | undefined = req.cookies?.[ACCESS_COOKIE_NAME_KEY]

  if (!token) {
    throw new AppError(401, 'No access token provided', 'UNAUTHORIZED')
  }

  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    throw new AppError(401, 'Invalid or expired access token', 'UNAUTHORIZED')
  }
}
