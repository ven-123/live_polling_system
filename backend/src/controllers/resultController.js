const resultService = require('../services/resultService')
const pollingLogicService = require('../services/pollingLogicService')

const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params

    const results = await resultService.getPollResults(pollId)
    res.json(results)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getActivePoll = async (req, res) => {
  try {
    const activePoll = await pollingLogicService.getActivePoll()

    if (!activePoll) {
      return res.json({ data: null, message: 'No active poll' })
    }

    const pollWithTime = await pollingLogicService.getPollWithTimeRemaining(activePoll._id)
    res.json(pollWithTime)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getPollHistory = async (req, res) => {
  try {
    const polls = await pollingLogicService.getPollHistory()
    res.json(polls)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  getPollResults,
  getActivePoll,
  getPollHistory
}
