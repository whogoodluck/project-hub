import type { Server as SocketIoServer } from 'socket.io'

let _io: SocketIoServer

export function setIo(io: SocketIoServer) {
  _io = io
}

export function getIo(): SocketIoServer {
  if (!_io) throw new Error('Socket.io not initialized')
  return _io
}
