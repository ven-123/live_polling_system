import io from 'socket.io-client'

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'

let socket = null

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

export const emitEvent = (event, data) => {
  if (socket) {
    socket.emit(event, data)
  }
}

export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback)
  }
}

export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback)
  }
}

const socketService = {
  connectSocket,
  disconnectSocket,
  getSocket,
  emitEvent,
  onEvent,
  offEvent
}

export default socketService
