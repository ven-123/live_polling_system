import { useState, useEffect } from 'react'

export const usePollTimer = (initialTime, isActive) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime || 0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) {
      setIsExpired(timeRemaining <= 0)
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, timeRemaining])

  const resetTimer = (newTime) => {
    setTimeRemaining(newTime)
    setIsExpired(false)
  }

  return {
    timeRemaining,
    isExpired,
    resetTimer,
    formatTime: () => {
      const minutes = Math.floor(timeRemaining / 60)
      const seconds = timeRemaining % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }
}
