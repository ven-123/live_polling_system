const Poll = require('../models/Poll')
const Vote = require('../models/Vote')

const createPoll = async ({ question, options, duration }) => {
  if (!question || !options || options.length < 2) {
    throw new Error('Invalid poll data: question and at least 2 options are required')
  }

  if (!duration || duration <= 0) {
    throw new Error('Invalid duration: must be greater than 0')
  }

  return await Poll.create({
    question,
    options,
    duration,
    status: 'PENDING',
    isActive: false
  })
}

const activatePoll = async (pollId) => {
  
  const existingActivePoll = await Poll.findOne({ status: 'ACTIVE' })

  if (existingActivePoll && existingActivePoll._id.toString() !== pollId) {
    throw new Error('Another poll is currently active. Close it first.')
  }

  const poll = await Poll.findByIdAndUpdate(
    pollId,
    {
      status: 'ACTIVE',
      isActive: true,
      startTime: new Date(),
      endTime: null
    },
    { new: true }
  )

  if (!poll) {
    throw new Error('Poll not found')
  }

  return poll
}

const getPollById = async (pollId) => {
  const poll = await Poll.findById(pollId)

  if (!poll) {
    throw new Error('Poll not found')
  }

  return poll
}

module.exports = {
  createPoll,
  activatePoll,
  getPollById
}
