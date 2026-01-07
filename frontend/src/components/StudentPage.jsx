import React, { useEffect } from 'react'
import { StudentOnboarding } from './StudentOnboarding'
import { StudentVoting } from './StudentVoting'
import { useAuth } from '../hooks/useAuth'
import { usePollState } from '../hooks/usePollState'
import { useSocket } from '../hooks/useSocket'
import { getActivePoll, getPoll } from '../services/api'
import './StudentPage.css'

export const StudentPage = () => {
  const { student, isAuthenticated, registerStudent } = useAuth()
  const { poll, results, voted, joinPoll, submitVote, setPoll } = usePollState(null)
  const { connected, emit } = useSocket()

  useEffect(() => {
    if (!isAuthenticated || !student) return

    const fetchActivePoll = async () => {
      try {
        const response = await getActivePoll()

        const respData = response && response.data !== undefined ? response.data : response

        if (respData && respData._id && student) {
          
          emit('join:poll', { pollId: respData._id, studentId: student.studentId })
         
          try {
            setPoll(respData)
          } catch (e) {
            console.warn('Failed to set local poll state', e)
          }
        }
      } catch (error) {
        console.log('No active poll at this time')
      }
    }

    fetchActivePoll()

  }, [isAuthenticated, student, joinPoll])

  useEffect(() => {
    if (!student || !poll) return
    emit('join:poll', { pollId: poll._id, studentId: student.studentId })
  }, [poll, student, emit])
  const handleOnboarding = (studentId,name) => {
    registerStudent(studentId, name)
  }

  const handleVote = (studentId, optionIndex) => {
    submitVote(studentId, optionIndex)
  }

  const handlePollExpired = async () => {
    try {
      if (!poll || !poll._id) return
      const resp = await getPoll(poll._id)
      if (resp && resp.data) {
        setPoll(resp.data)
      }
    } catch (err) {
      console.error('Failed to refresh poll on expiry:', err)
    }
  }

  if (!isAuthenticated) {
    return <StudentOnboarding onComplete={handleOnboarding} />
  }

  if (!student) {
    return <div className="student-page"><div className="loading">Loading...</div></div>
  }

  return (
    <div className="student-page">
      <div className="student-header">
        <div className="student-info">
          <h1>Live Polling</h1>
          <p>Welcome, {student.name}</p>
        </div>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          <span className="status-indicator" />
          {connected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      <StudentVoting
        poll={poll}
        results={results}
        voted={voted}
        studentId={student.studentId}
        onVote={handleVote}
        onPollExpired={handlePollExpired}
      />
    </div>
  )
}
