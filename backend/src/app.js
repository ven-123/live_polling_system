const express = require('express')
const cors = require('cors')

const pollRoutes = require('./routes/pollRoutes')
const voteRoutes = require('./routes/voteRoutes')
const studentRoutes = require('./routes/studentRoutes')
const resultRoutes = require('./routes/resultRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'Server is healthy' })
})

app.use('/api', pollRoutes)
app.use('/api', voteRoutes)
app.use('/api', studentRoutes)
app.use('/api', resultRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
