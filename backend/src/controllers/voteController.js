const voteService = require('../services/voteService')

const submitVote = async (req, res) => {
  try {
    const vote = await voteService.submitVote(req.body)
    res.status(201).json(vote)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  submitVote
}
