import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { AppError } from '../errors/AppError'
import prisma from '../lib/prisma'
import { JwtPayload } from '../types/auth.types'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { SigninInput, SignupInput } from '../validators/auth.validator'

async function hashToken(raw: string): Promise<string> {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export async function signup(data: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new AppError(409, 'Email already in use', 'EMAIL_TAKEN')

  const hashed = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return user
}

export async function signin(data: SigninInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } })

  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
  }

  if (!user.isActive) {
    throw new AppError(403, 'Account is deactivated', 'ACCOUNT_INACTIVE')
  }

  const payload: JwtPayload = {
    id: user.id,
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }

  const accessToken = signAccessToken(payload)
  const rawRefresh = signRefreshToken(payload)

  const hashedRefresh = await hashToken(rawRefresh)

  await prisma.refreshToken.create({
    data: {
      token: hashedRefresh,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return {
    accessToken,
    rawRefresh,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}

export async function refreshTokens(rawToken: string) {
  let payload: JwtPayload

  try {
    payload = verifyRefreshToken(rawToken)
  } catch {
    throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN')
  }

  const hashed = await hashToken(rawToken)

  const stored = await prisma.refreshToken.findUnique({ where: { token: hashed } })

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token expired or revoked', 'INVALID_REFRESH_TOKEN')
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } })

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user || !user.isActive) {
    throw new AppError(401, 'User not found or inactive', 'UNAUTHORIZED')
  }

  const newPayload: JwtPayload = {
    id: user.id,
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
  const newAccess = signAccessToken(newPayload)
  const newRawRefresh = signRefreshToken(newPayload)
  const newHashed = await hashToken(newRawRefresh)

  await prisma.refreshToken.create({
    data: {
      token: newHashed,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return { accessToken: newAccess, rawRefresh: newRawRefresh }
}

export async function signout(rawToken: string) {
  try {
    const hashed = await hashToken(rawToken)
    await prisma.refreshToken.updateMany({
      where: { token: hashed },
      data: { revoked: true },
    })
  } catch {
    // silently ignore — cookie will be cleared regardless
  }
}
