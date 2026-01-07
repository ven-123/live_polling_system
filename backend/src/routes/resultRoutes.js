const express = require('express')
const resultController = require('../controllers/resultController')

const router = express.Router()

router.get('/polls/:pollId/results', resultController.getPollResults)
router.get('/polls/active/current', resultController.getActivePoll)
router.get('/polls/history/all', resultController.getPollHistory)

module.exports = router
