import http from 'http'
import { Server as SocketIoServer } from 'socket.io'
import app from './app'
import { FRONTEND_URL, PORT } from './utils/env'
import { info } from './utils/logger'

const server = http.createServer(app)

const io = new SocketIoServer(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
})

server.listen(PORT, () => {
  info(`🚀 Server running at http://localhost:${PORT}`)
})

export { io }
