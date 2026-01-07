const Vote = require('../models/Vote')
const Poll = require('../models/Poll')

const getPollResults = async (pollId) => {
  const poll = await Poll.findById(pollId)

  if (!poll) {
    throw new Error('Poll not found')
  }

  const votes = await Vote.find({ pollId })

  const voteCounts = poll.options.map((option, index) => {
    const count = votes.filter((vote) => vote.optionIndex === index).length
    return {
      optionIndex: index,
      text: option.text,
      count: count,
      percentage: votes.length > 0 ? ((count / votes.length) * 100).toFixed(2) : 0
    }
  })

  let correctCount = null
  let correctPercentage = null
  if (poll.correctIndex !== undefined && poll.correctIndex !== null) {
    correctCount = votes.filter((v) => v.optionIndex === poll.correctIndex).length
    correctPercentage = votes.length > 0 ? ((correctCount / votes.length) * 100).toFixed(2) : '0.00'
  }

  return {
    poll: {
      id: poll._id,
      question: poll.question,
      status: poll.status,
      startTime: poll.startTime,
      endTime: poll.endTime,
      duration: poll.duration,
      totalVotes: votes.length,
      correctIndex: poll.correctIndex !== undefined ? poll.correctIndex : null
    },
    results: voteCounts,
    correctCount,
    correctPercentage
  }
}


const getTimeRemaining = (poll) => {
  if (!poll.startTime || poll.status !== 'ACTIVE') {
    return 0
  }

  const elapsedSeconds = Math.floor((Date.now() - new Date(poll.startTime).getTime()) / 1000)
  const remaining = Math.max(0, poll.duration - elapsedSeconds)

  return remaining
}

const hasAllStudentsAnswered = async (pollId, studentIds) => {
  if (!studentIds || studentIds.length === 0) {
    return false
  }

  const uniqueVoters = await Vote.distinct('studentId', { pollId })

  return uniqueVoters.length === studentIds.length
}

module.exports = {
  getPollResults,
  getTimeRemaining,
  hasAllStudentsAnswered
}
