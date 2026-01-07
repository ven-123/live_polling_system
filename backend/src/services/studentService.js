const Student = require('../models/Student')
const { v4: uuidv4 } = require('uuid')

const registerStudent = async (name) => {
  if (!name || name.trim().length === 0) {
    throw new Error('Student name is required')
  }

  const studentId = uuidv4()

  const student = await Student.create({
    studentId,
    name: name.trim()
  })

  return {
    studentId: student.studentId,
    name: student.name
  }
}

const getStudent = async (studentId) => {
  const student = await Student.findOne({ studentId })

  if (!student) {
    throw new Error('Student not found')
  }

  return {
    studentId: student.studentId,
    name: student.name
  }
}

const updateStudentActivity = async (studentId) => {
  await Student.findOneAndUpdate(
    { studentId },
    { lastActive: new Date() },
    { new: true }
  )
}

module.exports = {registerStudent, getStudent, updateStudentActivity}
