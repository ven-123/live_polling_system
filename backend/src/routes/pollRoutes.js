const express = require('express')
const pollController = require('../controllers/pollController')

const router = express.Router()

router.post('/polls', pollController.createPoll)
router.get('/polls', pollController.getAllPolls)
router.get('/polls/:id', pollController.getPoll)
router.patch('/polls/:id/activate', pollController.activatePoll)
router.patch('/polls/:id/close', pollController.closePoll)
router.patch('/polls/:id/complete', pollController.completePoll)

module.exports = router
