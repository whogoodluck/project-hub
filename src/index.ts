import http from 'http'
import { Server as SocketIoServer } from 'socket.io'
import app from './app'
import { registerSocketHandlers } from './sockets/handlers'
import { setIo } from './sockets/io'
import { FRONTEND_URL, PORT } from './utils/env'
import { info } from './utils/logger'

const server = http.createServer(app)

const io = new SocketIoServer(server, {
  cors: { origin: FRONTEND_URL, credentials: true },
})

setIo(io)
registerSocketHandlers(io)

server.listen(PORT, () => {
  info(`🚀 Server running at http://localhost:${PORT}`)
})

export { io }
