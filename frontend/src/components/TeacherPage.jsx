import React, { useState, useEffect } from 'react'
import { createPoll, activatePoll, getPollHistory, getPollResults, getActivePoll } from '../services/api'
import { closePoll as apiClosePoll } from '../services/api'
import { Timer } from './Timer'
import { useAlert } from './Alert'
import { useSocket } from '../hooks/useSocket'
import './TeacherPage.css'

export const TeacherPage = () => {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [duration, setDuration] = useState(60)
  const [polls, setPolls] = useState([])
  const [activePoll, setActivePoll] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showAlert, AlertComponent } = useAlert()
  const { connected, emit, on, off } = useSocket()

  useEffect(() => {
    fetchPollHistory()

    const handleResultsUpdate = (resultsData) => {
      setResults(resultsData)
    }

    on('results:update', handleResultsUpdate)

    return () => {
      off('results:update', handleResultsUpdate)
    }
  }, [on, off])

  useEffect(() => {
    let recheckTimer = null

    const loadActive = async () => {
      try {
        const response = await getActivePoll()
        
        const respData = response && response.data !== undefined ? response.data : response
        const active = respData && respData._id ? respData : null
        if (active) {
          console.info('Teacher: setting active poll', active._id, 'timeRemaining=', active.timeRemaining)
          setActivePoll(active)
         
          if (recheckTimer) {
            clearTimeout(recheckTimer)
            recheckTimer = null
          }
          try {
            emit('join:poll', { pollId: active._id, studentId: 'teacher' })
          } catch (e) {
            console.warn('Failed to emit join:poll for teacher', e)
          }
        
          fetchResults(active._id)
        } else if (respData && respData.data === null) {
          if (activePoll) {
            if (!recheckTimer) {
              recheckTimer = setTimeout(async () => {
                try {
                  const r = await getActivePoll()
                  const rData = r && r.data !== undefined ? r.data : r
                  if (!rData || !rData._id) {
                    console.info('Teacher: clearing active poll after recheck')
                    setActivePoll(null)
                    setResults(null)
                  } else {
                    console.info('Teacher: active poll recheck found poll', rData._id)
                    setActivePoll(rData)
                    fetchResults(rData._id)
                  }
                } catch (e) {
                  console.error('Teacher: recheck active poll failed', e)
                }
                recheckTimer = null
              }, 500)
            }
          } else {
            setActivePoll(null)
            setResults(null)
          }
        }
      } catch (err) {
        console.error('Failed to load active poll:', err)
      }
    }

    loadActive()

    const handlePollNew = (pollData) => {
      setActivePoll(pollData)
    
      try {
        emit('join:poll', { pollId: pollData._id, studentId: 'teacher' })
      } catch (e) {
        console.warn('Failed to emit join:poll on poll:new', e)
      }
      fetchResults(pollData._id)
    }

    const handlePollClosed = (data) => {
    
      setResults(data)
      setActivePoll((prev) => (prev ? { ...prev, status: 'CLOSED' } : prev))
    }

    const handlePollExpired = (data) => {
      setResults(data)
      setActivePoll((prev) => (prev ? { ...prev, status: 'CLOSED' } : prev))
    }

    on('poll:closed', handlePollClosed)
    on('poll:expired', handlePollExpired)

    on('poll:new', handlePollNew)

    return () => {
      off('poll:new', handlePollNew)
      off('poll:closed', handlePollClosed)
      off('poll:expired', handlePollExpired)
    }
  }, [on, off])

  const fetchPollHistory = async () => {
    try {
      const response = await getPollHistory()
      setPolls(response.data)
    } catch (error) {
      console.error('Failed to fetch poll history:', error)
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    } else {
      showAlert('error', 'Poll must have at least 2 options')
    }
  }

  const handleCreatePoll = async (e) => {
    e.preventDefault()

    if (!question.trim()) {
      showAlert('error', 'Please enter a question')
      return
    }

    const filteredOptions = options.filter((opt) => opt.trim())

    if (filteredOptions.length < 2) {
      showAlert('error', 'Poll must have at least 2 options')
      return
    }

    if (duration <= 0) {
      showAlert('error', 'Duration must be greater than 0')
      return
    }

    setLoading(true)

    try {
      const pollData = {
        question: question.trim(),
        options: filteredOptions.map((text) => ({ text: text.trim() })),
        duration: parseInt(duration)
      }

      const response = await createPoll(pollData)
      const newPoll = response.data

      setPolls([newPoll, ...polls])
      setQuestion('')
      setOptions(['', '', '', ''])
      setDuration(60)

      showAlert('success', 'Poll created successfully!')

      handleActivatePoll(newPoll._id)
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  const handleActivatePoll = async (pollId) => {
    try {
      const response = await activatePoll(pollId)
      const activatedPoll = response.data

      setActivePoll(activatedPoll)
      setPolls(polls.map((p) => (p._id === pollId ? activatedPoll : p)))

      emit('poll:start', { pollId })

      try {
        emit('join:poll', { pollId, studentId: 'teacher' })
      } catch (e) {
        console.warn('Failed to emit join:poll after activation', e)
      }

      showAlert('success', 'Poll activated! Broadcasting to students...', 3000)

      fetchResults(pollId)
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to activate poll')
      try {
        const resp = await getActivePoll()
        const active = resp.data && resp.data._id ? resp.data : null
        setActivePoll(active)
        if (active) fetchResults(active._id)
      } catch (e) {
        console.error('Failed to refresh active poll after activation error', e)
      }
    }
  }

  const fetchResults = async (pollId) => {
    try {
      const response = await getPollResults(pollId)
      setResults(response.data)
    } catch (error) {
      console.error('Failed to fetch results:', error)
    }
  }

  return (
    <div className="teacher-page">
      {AlertComponent}

      <div className="teacher-header">
        <h1>Teacher Dashboard</h1>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          <span className="status-indicator" />
          {connected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      <div className="teacher-container">
        <div className="create-poll-section">
          <div className="card">
            <h2>Create New Poll</h2>

            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <label htmlFor="question">Question</label>
                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Options</label>
                <div className="options-list">
                  {options.map((option, index) => (
                    <div key={index} className="option-input-group">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        disabled={loading}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemoveOption(index)}
                          disabled={loading}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddOption}
                  disabled={loading}
                >
                  + Add Option
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (seconds)</label>
                <input
                  id="duration"
                  type="number"
                  min="5"
                  max="600"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create & Activate Poll'}
              </button>
            </form>
          </div>
        </div>

        <div className="results-section">
          {activePoll ? (
            <div className="card">
              <h2>Live Poll</h2>
              <div className="active-poll">
                    <h3>{activePoll.question}</h3>
                    {activePoll.status === 'ACTIVE' && (
                      <div style={{ marginTop: '8px' }}>
                        <Timer
                          pollId={activePoll._id}
                          isActive={true}
                          onExpire={async () => {
                        
                            try {
                              emit('poll:close', { pollId: activePoll._id })
                            } catch (e) {
                              console.warn('Failed to emit poll:close', e)
                              try {
                                await apiClosePoll(activePoll._id)
                              } catch (err) {
                                console.error('Fallback close poll API failed', err)
                              }
                            }

                            fetchResults(activePoll._id)
                
                            try {
                              const resp = await getActivePoll()
                              const active = resp.data && resp.data._id ? resp.data : null
                              setActivePoll(active)
                            } catch (err) {
                              console.error('Failed to refresh active poll after expire', err)
                            }
                          }}
                        />
                      </div>
                    )}
                <p className="poll-meta">
                  Status: <span className="status-badge active">{activePoll.status}</span>
                </p>

                {results && (
                  <div className="live-results">
                    <h4>Live Results</h4>
                    {results.correctCount !== null && results.correctCount !== undefined && (
                      <div className="correct-summary" style={{ marginBottom: '8px' }}>
                        <strong>Correct answers:</strong> {results.correctCount} ({results.correctPercentage}%)
                      </div>
                    )}
                    <div className="results-grid">
                      {results.results?.map((result, index) => (
                        <div key={index} className="result-card">
                          <div className="result-option">
                            {String.fromCharCode(65 + index)}: {result.text}
                          </div>
                          <div className="result-count">{result.count} votes</div>
                          <div className="result-percentage">{result.percentage}%</div>
                          <div className="result-bar">
                            <div
                              className="result-bar-fill"
                              style={{ width: `${result.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="total-votes">Total Votes: {results.poll.totalVotes}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <p>No active poll</p>
                <p>Create a poll and activate it to see live results</p>
              </div>
            </div>
          )}

          <div className="card">
            <h2>Poll History</h2>
            <div className="poll-history">
              {polls.length > 0 ? (
                polls.map((poll) => (
                  <div key={poll._id} className="poll-history-item">
                    <div className="poll-info">
                      <h4>{poll.question}</h4>
                      <p>Status: {poll.status}</p>
                    </div>
                    <button
                      className="btn btn-small"
                      onClick={() => handleActivatePoll(poll._id)}
                      disabled={poll.status === 'ACTIVE'}
                    >
                      {poll.status === 'ACTIVE' ? 'Active' : 'Activate'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty">No polls yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
