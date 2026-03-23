import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Request, Response } from 'express'
import express from 'express'
import morgan from 'morgan'
import path from 'path'

import { errorHandler } from './errors/errorHandler'
import router from './routes'
import { FRONTEND_URL } from './utils/env'

const app = express()

const WEB_DIST = path.join(process.cwd(), 'web', 'dist')

app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/v1', router)

app.use(
  express.static(WEB_DIST, {
    setHeaders(res, filePath) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
    },
  })
)

app.get(/^(?!\/api).*/, (_req: Request, res: Response) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.sendFile(path.join(WEB_DIST, 'index.html'))
})

app.use(errorHandler)

export default app
