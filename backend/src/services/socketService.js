const pollingLogicService = require('./pollingLogicService')
const resultService = require('./resultService')

let pollTimers = {} 

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Student connected: ${socket.id}`)

    socket.on('join:poll', async (data) => {
      try {
        const { pollId, studentId } = data
        socket.join(`poll:${pollId}`)
        socket.join(`student:${studentId}`)

        console.log(`Student ${studentId} joined poll ${pollId}`)

        const poll = await pollingLogicService.getPollWithTimeRemaining(pollId)
        if (poll) {
          console.log(`Sending poll:state to ${socket.id} for poll ${pollId} (timeRemaining=${poll.timeRemaining})`)
          socket.emit('poll:state', poll)
        }
      } catch (error) {
        socket.emit('error:message', { error: error.message })
      }
    })

    socket.on('vote:submit', async (data) => {
      try {
        const { pollId, studentId, optionIndex } = data

        const Vote = require('../models/Vote')
        const Poll = require('../models/Poll')

        const poll = await Poll.findById(pollId)
        if (!poll || poll.status !== 'ACTIVE') {
          throw new Error('Poll is not active')
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
          throw new Error('Invalid option selected')
        }

        const vote = await Vote.create({ pollId, studentId, optionIndex })

        console.log(`Vote submitted: ${studentId} for poll ${pollId}`)

        const results = await resultService.getPollResults(pollId)
        io.to(`poll:${pollId}`).emit('results:update', results)

        socket.emit('vote:success', vote)
      } catch (error) {
        socket.emit('error:message', { error: error.message })
      }
    })

    socket.on('poll:start', async (data) => {
      try {
        const { pollId } = data

        const poll = await pollingLogicService.getPollWithTimeRemaining(pollId)
        if (poll) {

          io.emit('poll:new', poll)

          startPollTimer(io, pollId, poll.duration)
        }
      } catch (error) {
        socket.emit('error:message', { error: error.message })
      }
    })

    socket.on('poll:close', async (data) => {
      try {
        const { pollId } = data

        await pollingLogicService.closePoll(pollId)
        clearPollTimer(pollId)

        const results = await resultService.getPollResults(pollId)
        io.to(`poll:${pollId}`).emit('poll:closed', results)

        console.log(`Poll ${pollId} closed`)
      } catch (error) {
        socket.emit('error:message', { error: error.message })
      }
    })

    socket.on('timer:sync', async (data) => {
      try {
        const { pollId } = data

        const poll = await pollingLogicService.getPollWithTimeRemaining(pollId)
        if (poll) {
          console.log(`timer:sync from ${socket.id} for poll ${pollId} -> timeRemaining=${poll.timeRemaining}`)
          socket.emit('timer:update', {
            pollId,
            timeRemaining: poll.timeRemaining,
            serverTime: new Date().getTime()
          })
        }
      } catch (error) {
        socket.emit('error:message', { error: error.message })
      }
    })

    socket.on('disconnect', () => {
      console.log(`Student disconnected: ${socket.id}`)
    })
  })
}

const startPollTimer = (io, pollId, duration) => {
  if (pollTimers[pollId]) {
    clearInterval(pollTimers[pollId])
  }

  console.log(`Starting poll timer for ${pollId} with duration=${duration}`)

  pollTimers[pollId] = setInterval(async () => {
    try {
      const pollWithTime = await pollingLogicService.getPollWithTimeRemaining(pollId)
      if (!pollWithTime) return

      const remaining = pollWithTime.timeRemaining

      if (remaining % 5 === 0 || remaining <= 5) {
        console.log(`Timer tick for ${pollId}: remaining=${remaining}`)
      }

      io.to(`poll:${pollId}`).emit('timer:tick', {
        pollId,
        timeRemaining: remaining
      })

      if (remaining <= 0) {
        clearInterval(pollTimers[pollId])
        delete pollTimers[pollId]

        try {
          await pollingLogicService.closePoll(pollId)
          const results = await resultService.getPollResults(pollId)
          io.to(`poll:${pollId}`).emit('poll:expired', results)
          console.log(`Poll ${pollId} auto-closed by timer`)
        } catch (error) {
          console.error('Error auto-closing poll:', error)
        }
      }
    } catch (err) {
      console.error('Error in poll timer loop for',pollId, err)
    }
  }, 1000)
}

const clearPollTimer = (pollId) => {
  if (pollTimers[pollId]) {
    clearInterval(pollTimers[pollId])
    delete pollTimers[pollId]
  }
}

module.exports = {
  setupSocketHandlers, startPollTimer, clearPollTimer
}
