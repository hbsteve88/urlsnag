'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, X, Zap } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'promoted' | 'useraction'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-2 max-w-sm">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 animate-in slide-in-from-left-full ${
            toast.type === 'promoted'
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-2 border-yellow-600 shadow-yellow-200'
              : toast.type === 'useraction'
              ? 'bg-gradient-to-r from-gray-300 to-gray-400 border-2 border-gray-500 shadow-gray-200'
              : 'bg-white border-2 border-blue-500'
          }`}
          style={{
            animation: `slideInLeft 0.3s ease-out, slideDown 0.3s ease-out ${index * 0.1}s`,
          }}
        >
          {toast.type === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'promoted' && (
            <Zap className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'useraction' && (
            <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            {toast.type === 'promoted' ? (
              <div className="min-w-64">
                <p className="text-lg font-bold mb-3 text-yellow-900">
                  {toast.message.split(' - ')[0]}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      toast.action?.onClick()
                      onRemove(toast.id)
                    }}
                    className="text-white shadow-md hover:shadow-lg text-xs font-semibold px-4 py-2 rounded-md transition flex-shrink-0 bg-yellow-600 hover:bg-yellow-700"
                  >
                    {toast.action?.label}
                  </button>
                  <span className="text-sm text-right flex-shrink-0 text-yellow-900">
                    {toast.message.split(' - ')[1]}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800">
                {/* For standard notifications, make domain names bold */}
                {(() => {
                  const parts = toast.message.split(/(\b[a-zA-Z0-9][\w.-]*\.[\w.-]+\b)/)
                  return parts.map((part, i) => 
                    /\b[a-zA-Z0-9][\w.-]*\.[\w.-]+\b/.test(part) ? (
                      <span key={i} className="font-bold">{part}</span>
                    ) : (
                      part
                    )
                  )
                })()}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className={`flex-shrink-0 transition ${
              toast.type === 'promoted'
                ? 'text-yellow-700 hover:text-yellow-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
