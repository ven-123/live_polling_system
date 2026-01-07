const studentService = require('../services/studentService')

const registerStudent = async (req, res) => {
  try {
    const { name } = req.body

    const student = await studentService.registerStudent(name)
    res.status(201).json(student)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getStudent = async (req, res) => {
  try {
    const { studentId } = req.params

    const student = await studentService.getStudent(studentId)
    res.json(student)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  registerStudent,
  getStudent
}
