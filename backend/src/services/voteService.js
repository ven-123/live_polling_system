const Vote = require('../models/Vote')
const Poll = require('../models/Poll')

const submitVote = async ({ pollId, studentId, optionIndex }) => {
  const poll = await Poll.findById(pollId)

  if (!poll || !poll.isActive) {
    throw new Error('Poll is not active')
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    throw new Error('Invalid option selected')
  }

  const vote = await Vote.create({
    pollId,
    studentId,
    optionIndex
  })

  return vote
}

module.exports = {submitVote}
