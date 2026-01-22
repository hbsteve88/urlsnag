'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import Toast, { ToastType, ToastMessage } from './Toast'

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number, action?: { label: string; onClick: () => void }) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  promoted: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => void
  useraction: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)
const MAX_VISIBLE_TOASTS = 5
const STAGGER_DELAY = 1000 // 1 second between showing each notification

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [visibleToasts, setVisibleToasts] = useState<string[]>([])
  const queueRef = useRef<ToastMessage[]>([])
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) return
    if (visibleToasts.length >= MAX_VISIBLE_TOASTS) return

    const nextToast = queueRef.current.shift()
    if (!nextToast) return

    setVisibleToasts(prev => [...prev, nextToast.id])

    // Schedule removal based on duration
    const duration = nextToast.duration || 3000
    const timeoutId = setTimeout(() => {
      setVisibleToasts(prev => prev.filter(id => id !== nextToast.id))
      setToasts(prev => prev.filter(t => t.id !== nextToast.id))
      
      // Process next in queue after this one closes
      setTimeout(() => {
        processQueue()
      }, STAGGER_DELAY)
    }, duration)

    timeoutsRef.current[nextToast.id] = timeoutId
  }, [visibleToasts])

  // Process queue whenever visible toasts change
  useEffect(() => {
    if (visibleToasts.length < MAX_VISIBLE_TOASTS && queueRef.current.length > 0) {
      processQueue()
    }
  }, [visibleToasts, processQueue])

  const showToast = useCallback((message: string, type: ToastType, duration = 3000, action?: { label: string; onClick: () => void }) => {
    const id = Date.now().toString() + Math.random()
    const newToast: ToastMessage = { id, type, message, duration, action }
    
    setToasts(prev => [...prev, newToast])
    queueRef.current.push(newToast)

    // Start processing if we have room
    if (visibleToasts.length < MAX_VISIBLE_TOASTS) {
      processQueue()
    }
  }, [visibleToasts, processQueue])

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [showToast])

  const promoted = useCallback((message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
    showToast(message, 'promoted', duration, action)
  }, [showToast])

  const useraction = useCallback((message: string, duration?: number) => {
    showToast(message, 'useraction', duration)
  }, [showToast])

  const removeToast = (id: string) => {
    setVisibleToasts(prev => prev.filter(t => t !== id))
    setToasts(prev => prev.filter(t => t.id !== id))
    
    // Clear timeout if exists
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }

    // Process next in queue
    setTimeout(() => {
      processQueue()
    }, STAGGER_DELAY)
  }

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, promoted, useraction }}>
      {children}
      <Toast toasts={visibleToasts.map(id => toasts.find(t => t.id === id)).filter(Boolean) as ToastMessage[]} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
