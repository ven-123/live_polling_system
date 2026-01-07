import React, { useEffect, useState, useRef } from 'react'
import { useSocket } from '../hooks/useSocket'
import './Timer.css'

export const Timer = ({ pollId, isActive, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const { emit, on, off } = useSocket()
  const prevRemaining = useRef(null)

  useEffect(() => {
    if (!isActive || !pollId) return

    emit('timer:sync', { pollId })

    const handleTimerUpdate = (data) => {
      if (data.pollId === pollId) {
        setTimeRemaining(data.timeRemaining)
      }
    }

    const handleTimerTick = (data) => {
      if (data.pollId === pollId) {
        setTimeRemaining(data.timeRemaining)
      }
    }

    on('timer:update', handleTimerUpdate)
    on('timer:tick', handleTimerTick)

    const syncInterval = setInterval(() => {
      emit('timer:sync', { pollId })
    }, 2000)

    return () => {
      clearInterval(syncInterval)
      off('timer:update', handleTimerUpdate)
      off('timer:tick', handleTimerTick)
    }
  }, [pollId, isActive, emit, on, off])

  useEffect(() => {
    const prev = prevRemaining.current
    if (prev !== null && prev > 0 && timeRemaining === 0 && isActive) {
      console.info('Timer expired for poll', pollId)
      onExpire?.()
    }
    prevRemaining.current = timeRemaining
  }, [timeRemaining, isActive, onExpire, pollId])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const getTimerClass = () => {
    if (timeRemaining <= 10) return 'timer-danger'
    if (timeRemaining <= 30) return 'timer-warning'
    return 'timer-normal'
  }

  return (
    <div className={`timer ${getTimerClass()}`}>
      <div className="timer-display">
        {minutes}:{seconds.toString().padStart(2,'0')}
      </div>
      <div className="timer-label">seconds remaining</div>
    </div>
  )
}
