const Poll = require('../models/Poll')
const Vote = require('../models/Vote')
const resultService = require('./resultService')

const closePoll = async (pollId) => {
  const poll = await Poll.findByIdAndUpdate(
    pollId,
    {
      status: 'CLOSED',
      endTime: new Date(),
      isActive: false
    },
    { new: true }
  )

  if (!poll) {
    throw new Error('Poll not found')
  }

  return poll
}

const completePoll = async (pollId) => {
  const poll = await Poll.findByIdAndUpdate(
    pollId,
    {
      status: 'COMPLETED',
      endTime: new Date(),
      isActive: false
    },
    { new: true }
  )

  if (!poll) {
    throw new Error('Poll not found')
  }

  return poll
}

const getActivePoll = async () => {
  const activePoll = await Poll.findOne({
    status: 'ACTIVE'
  }).sort({ startTime: -1 })

  return activePoll
}

const getPollWithTimeRemaining = async (pollId) => {
  const poll = await Poll.findById(pollId)

  if (!poll) {
    return null
  }

  const timeRemaining = resultService.getTimeRemaining(poll)

  return {
    ...poll.toObject(),
    timeRemaining
  }
}

const getAllPolls = async (limit = 10) => {
  const polls = await Poll.find()
    .sort({ createdAt: -1 })
    .limit(limit)

  return polls
}

const getPollHistory = async () => {
  const polls = await Poll.find({
    status: { $in: ['CLOSED', 'COMPLETED'] }
  })
    .sort({ endTime: -1 })
    .limit(20)

  return polls
}

module.exports = {
  closePoll,
  completePoll,
  getActivePoll,
  getPollWithTimeRemaining,
  getAllPolls,
  getPollHistory
}
