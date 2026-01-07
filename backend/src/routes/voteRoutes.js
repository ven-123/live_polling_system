const express = require('express')
const voteController = require('../controllers/voteController')

const router = express.Router()

router.post('/votes', voteController.submitVote)

module.exports = router
