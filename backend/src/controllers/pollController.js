const pollService = require('../services/pollService')
const pollingLogicService = require('../services/pollingLogicService')
const resultService = require('../services/resultService')

const createPoll = async (req, res) => {
  try {
    const poll = await pollService.createPoll(req.body)
    res.status(201).json(poll)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const activatePoll = async (req, res) => {
  try {
    const poll = await pollService.activatePoll(req.params.id)

    const io = req.app.get('io')
    if (io) {

      const pollingLogicService = require('../services/pollingLogicService')
      const pollWithTime = await pollingLogicService.getPollWithTimeRemaining(poll._id)
      if (pollWithTime) {
        io.emit('poll:new', pollWithTime)
      } else {
        io.emit('poll:new', poll)
      }

      const { startPollTimer } = require('../services/socketService')
      startPollTimer(io, poll._id, poll.duration)
    }

    try {
      const pollingLogicService = require('../services/pollingLogicService')
      const pollWithTime = await pollingLogicService.getPollWithTimeRemaining(poll._id)
      return res.json(pollWithTime || poll)
    } catch (e) {
      return res.json(poll)
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const closePoll = async (req, res) => {
  try {
    const poll = await pollingLogicService.closePoll(req.params.id)

    const io = req.app.get('io')
    if (io) {
      const { clearPollTimer } = require('../services/socketService')
      clearPollTimer(req.params.id)
      const results = await resultService.getPollResults(req.params.id)
      io.to(`poll:${req.params.id}`).emit('poll:closed', results)
    }

    res.json(poll)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const completePoll = async (req, res) => {
  try {
    const poll = await pollingLogicService.completePoll(req.params.id)
    res.json(poll)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getPoll = async (req, res) => {
  try {
    const poll = await pollingLogicService.getPollWithTimeRemaining(req.params.id)

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }

    res.json(poll)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getAllPolls = async (req, res) => {
  try {
    const polls = await pollingLogicService.getAllPolls()
    res.json(polls)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  createPoll,
  activatePoll,
  closePoll,
  completePoll,
  getPoll,
  getAllPolls
}
