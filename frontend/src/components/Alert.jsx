import React, { useEffect, useState } from 'react'
import './Alert.css'

export const Alert = ({ type = 'info', message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <span>{message}</span>
        <button
          className="alert-close"
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export const useAlert = () => {
  const [alert, setAlert] = useState(null)

  const showAlert = (type, message, duration = 5000) => {
    setAlert({ type, message, duration })
  }

  const closeAlert = () => {
    setAlert(null)
  }

  const AlertComponent = alert ? (
    <Alert
      type={alert.type}
      message={alert.message}
      onClose={closeAlert}
      duration={alert.duration}
    />
  ) : null

  return {
    alert,
    showAlert,
    closeAlert,
    AlertComponent
  }
}
