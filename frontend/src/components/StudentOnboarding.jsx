import React, { useState } from 'react'
import { registerStudent } from '../services/api'
import { useAlert } from './Alert'
import './StudentOnboarding.css'

export const StudentOnboarding = ({ onComplete }) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { showAlert, AlertComponent } = useAlert()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      showAlert('error', 'Please enter your name')
      return
    }

    setLoading(true)

    try {
      const response = await registerStudent(name)
      const { studentId, name: studentName } = response.data

      onComplete?.(studentId, studentName)
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-container">
      {AlertComponent}
      <div className="onboarding-card">
        <h1>Welcome to Live Polling</h1>
        <p>Enter your name to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
              autoFocus
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Join Now'}
          </button>
        </form>

        <div className="onboarding-info">
          <p>✓ Your name will be saved for this session</p>
          <p>✓ You'll receive questions in real-time</p>
          <p>✓ Answer within the time limit</p>
        </div>
      </div>
    </div>
  )
}
