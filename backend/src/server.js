require('dotenv').config()
const http = require('http')
const app = require('./app')
const connectDB = require('./config/db')
const { Server } = require('socket.io')
const { setupSocketHandlers } = require('./services/socketService')

async function startServer() {

  await connectDB()

  const server = http.createServer(app)

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true
    }
  })

  setupSocketHandlers(io)

  app.set('io', io)

  const PORT = process.env.PORT || 5000
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`WebSocket server ready for connections`)
  })
}

startServer().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
