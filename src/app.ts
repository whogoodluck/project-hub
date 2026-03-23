import cors from 'cors'
import express, { Request, Response } from 'express'
import morgan from 'morgan'

import path from 'path'
import router from './routes'
import { FRONTEND_URL } from './utils/env'

const app = express()

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
)

app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', router)

// React App
app.use(
  express.static(path.join(__dirname, '../web/dist'), {
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

app.use((req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }

  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  res.sendFile(path.join(__dirname, '../web/dist/index.html'))
})

app.use((_req: Request, res: Response) => {
  console.error('Unknown endpoint')
  res.status(404).json({
    message: 'Unknown endpoint',
  })
})

export default app
