const express = require('express')
const studentController = require('../controllers/studentController')

const router = express.Router()

router.post('/students/register', studentController.registerStudent)
router.get('/students/:studentId', studentController.getStudent)

module.exports = router
