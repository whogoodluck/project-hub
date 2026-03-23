import { config } from 'dotenv'

config()

export const PORT = process.env.PORT || 5000
export const PROJECT_NAME = process.env.PROJECT_NAME || 'Project Hub'
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
export const NODE_ENV = process.env.NODE_ENV || 'development'

export const DATABASE_URL = process.env.DATABASE_URL

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
