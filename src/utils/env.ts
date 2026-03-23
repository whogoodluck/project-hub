import { config } from 'dotenv'

config()

export const PORT = process.env.PORT || 5000

export const PROJECT_NAME = process.env.PROJECT_NAME || 'Project Hub'

export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
