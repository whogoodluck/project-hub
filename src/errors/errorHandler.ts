import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { NODE_ENV } from '../utils/env'
import { AppError } from './AppError'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      code: 'VALIDATION_ERROR',
      errors: err.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code ?? 'ERROR',
      message: err.message,
    })
    return
  }

  const message = NODE_ENV === 'production' ? 'Internal server error' : String(err)

  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message,
  })
}
