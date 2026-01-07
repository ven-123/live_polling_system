import React, { useState } from 'react'
import { StudentPage } from './components/StudentPage'
import { TeacherPage } from './components/TeacherPage'
import { useSocket } from './hooks/useSocket'
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa'
import './App.css'

function App() {
  const [userRole, setUserRole] = useState(null)
  const { connected } = useSocket()

  if (!userRole) {
    return (
      <div className="role-selector">
        <div className="role-card">
          <h1>Live Polling System</h1>
          <p>Select your role to continue</p>

          <div className="role-buttons">
            <button
              className="role-btn student-btn"
              onClick={() => setUserRole('student')}
            >
              <span className="role-icon">
                <FaUserGraduate />
              </span>
              <span>I'm a Student</span>
            </button>

            <button
              className="role-btn teacher-btn"
              onClick={() => setUserRole('teacher')}
            >
              <span className="role-icon">
                <FaChalkboardTeacher />
              </span>
              <span>I'm a Teacher</span>
            </button>
          </div>

          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot" />
            {connected ? 'Connected to Server' : 'Connecting to Server...'}
          </div>
        </div>
      </div>
    )
  }

  return userRole === 'student' ? <StudentPage /> : <TeacherPage />
}

export default App
