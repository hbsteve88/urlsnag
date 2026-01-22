'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import SignIn from './SignIn'
import SignUp from './SignUp'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        <div className="p-8">
          {mode === 'signin' ? (
            <SignIn
              onSuccess={onClose}
              onSwitchToSignUp={() => setMode('signup')}
            />
          ) : (
            <SignUp
              onSuccess={onClose}
              onSwitchToSignIn={() => setMode('signin')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
