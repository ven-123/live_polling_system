import React, { useEffect, useState } from 'react'
import { Timer } from './Timer'
import { useAlert } from './Alert'
import './StudentVoting.css'

export const StudentVoting = ({ poll, results, voted, studentId, onVote, onPollExpired }) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const { showAlert, AlertComponent } = useAlert()

  useEffect(() => {
    if (voted) {
      showAlert('success', 'Your vote has been submitted!')
    }
  }, [voted, showAlert])

  const handleVoteSubmit = (optionIndex) => {
    if (voted) {
      showAlert('error', 'You have already voted on this poll')
      return
    }

    setSelectedOption(optionIndex)
    onVote?.(studentId, optionIndex)
  }

  if (!poll) {
    return (
      <div className="voting-container">
        <div className="loading">Waiting for poll...</div>
      </div>
    )
  }

  const isActive = poll.status === 'ACTIVE'
  const timeRemaining = poll.timeRemaining || 0

  return (
    <div className="voting-container">
      {AlertComponent}

      <div className="voting-card">
        <div className="voting-header">
          <h2>{poll.question}</h2>
          {isActive && (
            <Timer
              pollId={poll._id}
              isActive={isActive}
              onExpire={onPollExpired}
            />
          )}
        </div>

        <div className="voting-options">
          {poll.options?.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedOption === index ? 'selected' : ''} ${
                voted && selectedOption !== index ? 'disabled' : ''
              }`}
              onClick={() => handleVoteSubmit(index)}
              disabled={voted || !isActive || timeRemaining <= 0}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option.text}</span>
              {results?.results?.[index] && (
                <span className="option-percentage">
                  {results.results[index].percentage}%
                </span>
              )}
            </button>
          ))}
        </div>

        {voted && (
          <div className="voting-feedback">
            <p>✓ Your vote has been recorded</p>
          </div>
        )}

        {!isActive && (
          <div className="voting-closed">
            <p>This poll has ended</p>
          </div>
        )}

        {results && (
          <div className="results-summary">
            <h3>Live Results</h3>
            <div className="results-list">
              {results.results?.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-label">
                    <span>{String.fromCharCode(65 + index)}:</span>
                    <span>{result.text}</span>
                  </div>
                  <div className="result-bar-container">
                    <div
                      className="result-bar"
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                  <div className="result-stats">
                    <span>{result.count} votes</span>
                    <span>{result.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
