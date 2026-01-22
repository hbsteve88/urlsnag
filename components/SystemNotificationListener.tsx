'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useToast } from '@/components/ToastContext'
import { useSystemNotifications } from '@/lib/useSystemNotifications'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function SystemNotificationListener() {
  const { user } = useAuth()
  const { useraction, info } = useToast()
  const [displayTime, setDisplayTime] = useState(3000) // default 3 seconds

  // Fetch user's display time setting
  useEffect(() => {
    if (!user) return

    const fetchSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        if (userData?.notificationDisplayTime) {
          setDisplayTime(userData.notificationDisplayTime * 1000)
        }
      } catch (error) {
        console.error('Error fetching user settings:', error)
      }
    }

    fetchSettings()
  }, [user])

  const handleNotification = (event: any) => {
    switch (event.type) {
      case 'approved':
        useraction(`${event.domain} has been approved!`, displayTime)
        break
      case 'rejected':
        useraction(`${event.domain} was rejected. Reason: ${event.message}`, displayTime)
        break
      case 'promoted':
        useraction(event.message, displayTime)
        break
      case 'outbid':
        useraction(`You have a new offer on ${event.domain}!`, displayTime)
        break
      default:
        info(event.message, displayTime)
    }
  }

  useSystemNotifications(user?.uid, handleNotification)

  return null
}
