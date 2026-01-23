'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DevelopmentBanner() {
  const [notifyEmail, setNotifyEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notifyEmail.trim()) return
    
    try {
      await addDoc(collection(db, 'launch_notifications'), {
        email: notifyEmail,
        createdAt: serverTimestamp(),
      })
      setEmailSubmitted(true)
      setNotifyEmail('')
      setTimeout(() => setEmailSubmitted(false), 3000)
    } catch (err) {
      console.error('Error submitting email:', err)
    }
  }

  return (
    <div className="bg-red-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold">Site in Development</p>
          <p className="text-sm text-red-100">Enter your email to be notified when we launch.</p>
        </div>
        <form onSubmit={handleNotifySubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="your@email.com"
            className="px-3 py-2 rounded text-gray-900 text-sm flex-1 sm:flex-none"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white text-red-600 font-semibold rounded hover:bg-red-50 transition text-sm whitespace-nowrap"
          >
            {emailSubmitted ? '✓ Saved' : 'Notify Me'}
          </button>
        </form>
      </div>
    </div>
  )
}
