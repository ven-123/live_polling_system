import { useState, useEffect } from 'react'

const STUDENT_ID_KEY = 'polling_student_id'
const STUDENT_NAME_KEY = 'polling_student_name'

export const useAuth = () => {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedStudentId = sessionStorage.getItem(STUDENT_ID_KEY)
    const storedName = sessionStorage.getItem(STUDENT_NAME_KEY)

    if (storedStudentId && storedName) {
      setStudent({
        studentId: storedStudentId,
        name: storedName
      })
    }

    setLoading(false)
  }, [])

  const registerStudent = (studentId, name) => {
    setStudent({ studentId, name })
    sessionStorage.setItem(STUDENT_ID_KEY, studentId)
    sessionStorage.setItem(STUDENT_NAME_KEY, name)
  }

  const logout = () => {
    setStudent(null)
    sessionStorage.removeItem(STUDENT_ID_KEY)
    sessionStorage.removeItem(STUDENT_NAME_KEY)
  }

  return {student,loading,isAuthenticated: !!student,registerStudent,logout}
}
