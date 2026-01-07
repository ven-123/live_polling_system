import { useEffect, useState } from 'react'
import { connectSocket, onEvent, offEvent, emitEvent } from '../services/socket'

export const useSocket = () => {
  const [connected, setConnected] = useState(false)

  connectSocket()

  useEffect(() => {
    onEvent('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    onEvent('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    onEvent('error:message', (data) => {
      console.error('Socket error:', data.error)
    })

    return () => {
      offEvent('connect')
      offEvent('disconnect')
      offEvent('error:message')
    }
  }, [])

  return { connected, emit: emitEvent, on: onEvent, off: offEvent }
}
