import { useState, useEffect, useCallback } from 'react'
import { useSocket } from './useSocket'

export const usePollState = (pollId) => {
  const [poll, setPoll] = useState(null)
  const [results, setResults] = useState(null)
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState(null)
  const [currentPollId, setCurrentPollId] = useState(pollId)

  const { emit, on, off } = useSocket()

  useEffect(() => {
    const handlePollState = (pollData) => {
      setPoll(pollData)
      setError(null)
    }

    const handlePollNew = (pollData) => {
      setPoll(pollData)
      setCurrentPollId(pollData._id)
      setVoted(false)
      setResults(null)
      setError(null)
    }

    const handleResultsUpdate = (resultsData) => {
      setResults(resultsData)
    }

    const handleVoteSuccess = () => {
      setVoted(true)
    }

    const handlePollClosed = (data) => {
      setPoll((prev) => ({
        ...prev,
        status: 'CLOSED'
      }))
      setResults(data.results)
    }

    const handlePollExpired = (data) => {
      setPoll((prev) => ({
        ...prev,
        status: 'CLOSED'
      }))
      setResults(data.results)
    }

    const handleError = (data) => {
      setError(data.error)
    }

    on('poll:state', handlePollState)
    on('poll:new', handlePollNew)
    on('results:update', handleResultsUpdate)
    on('vote:success', handleVoteSuccess)
    on('poll:closed', handlePollClosed)
    on('poll:expired', handlePollExpired)
    on('error:message', handleError)

    return () => {
      off('poll:state', handlePollState)
      off('poll:new', handlePollNew)
      off('results:update', handleResultsUpdate)
      off('vote:success', handleVoteSuccess)
      off('poll:closed', handlePollClosed)
      off('poll:expired', handlePollExpired)
      off('error:message', handleError)
    }
  }, [on, off])

  const joinPoll = useCallback((studentId) => {
    if (currentPollId) {
      emit('join:poll', { pollId: currentPollId, studentId })
    }
  }, [currentPollId, emit])

  const submitVote = useCallback((studentId, optionIndex) => {
    if (currentPollId) {
      emit('vote:submit', { pollId: currentPollId, studentId, optionIndex })
    }
  }, [currentPollId, emit])

  return {
    poll,
    results,
    voted,
    error,
    joinPoll,
    submitVote,
    setPoll
  }
}
