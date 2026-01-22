'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/components/ToastContext'
import { Bell, Settings as SettingsIcon, ArrowLeft } from 'lucide-react'

interface UserSettings {
  notificationsEnabled: boolean
  notifyNewListings: boolean
  notifyTrendingDomains: boolean
  notifyLiveListings: boolean
  notificationDisplayTime: number // seconds (5-30)
  notificationUpdateFrequency: number // minutes (1-5)
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { success: showSuccess, promoted: showPromoted, error, info, useraction: showUserAction } = useToast()
  const [settings, setSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    notifyNewListings: true,
    notifyTrendingDomains: true,
    notifyLiveListings: true,
    notificationDisplayTime: 3,
    notificationUpdateFrequency: 1,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [notificationIndex, setNotificationIndex] = useState(0)

  useEffect(() => {
    if (authLoading || !user) return

    fetchSettings()
  }, [user, authLoading])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const settingsDoc = await getDoc(doc(db, 'userSettings', user!.uid))
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as UserSettings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'userSettings', user.uid), settings)
      setSuccess('Settings saved successfully!')
      setTimeout(() => {
        router.back()
      }, 500)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof UserSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (authLoading || loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return <div className="p-8">Please sign in to access settings</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Notifications Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4 pl-7">
              {/* Master Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={() => handleToggle('notificationsEnabled')}
                  className="w-5 h-5 rounded accent-blue-600"
                />
                <div>
                  <p className="font-medium text-gray-900">Enable Notifications</p>
                  <p className="text-sm text-gray-600">Receive popup notifications on the platform</p>
                </div>
              </label>

              {/* Sub-options (only show if notifications enabled) */}
              {settings.notificationsEnabled && (
                <div className="space-y-3 pl-8 border-l-2 border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyNewListings}
                      onChange={() => handleToggle('notifyNewListings')}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">New Listings</p>
                      <p className="text-xs text-gray-600">Get notified when new domains are listed</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyTrendingDomains}
                      onChange={() => handleToggle('notifyTrendingDomains')}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Trending Domains</p>
                      <p className="text-xs text-gray-600">Get notified about popular and trending domains</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyLiveListings}
                      onChange={() => handleToggle('notifyLiveListings')}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Live Listings</p>
                      <p className="text-xs text-gray-600">Get notified when your listings go live</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* System Notifications (Cannot be disabled) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">System Notifications</h2>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">Required</span>
            </div>

            <div className="space-y-3 pl-7 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-4">These critical notifications cannot be disabled for your protection:</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Outbids:</strong> When someone outbids you on a domain</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Domain Approved:</strong> When your domain listing is approved</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Domain Rejected:</strong> When your domain listing is rejected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Display Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Notification Display</h2>
            </div>

            <div className="space-y-6 pl-7">
              {/* Display Time */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Display Time: {settings.notificationDisplayTime} seconds
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={settings.notificationDisplayTime}
                  onChange={(e) => setSettings({ ...settings, notificationDisplayTime: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>5 sec</span>
                  <span>30 sec</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">How long notifications stay visible on screen</p>
              </div>

              {/* Update Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Update Frequency: Every {settings.notificationUpdateFrequency < 60 ? settings.notificationUpdateFrequency + ' seconds' : Math.floor(settings.notificationUpdateFrequency / 60) + ' minute' + (Math.floor(settings.notificationUpdateFrequency / 60) > 1 ? 's' : '')}
                </label>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="30"
                  value={settings.notificationUpdateFrequency}
                  onChange={(e) => setSettings({ ...settings, notificationUpdateFrequency: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Every 30 sec</span>
                  <span>Every 5 min</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">How frequently to check for new notifications</p>
              </div>
            </div>
          </div>

          {/* Test Notification Buttons */}
          <div className="pt-6 border-t border-gray-200 space-y-3">
            <button
              onClick={() => {
                const notifications = [
                  { type: 'success', message: 'example.com domain listed successfully!' },
                  { type: 'success', message: 'example.com has been approved!' },
                  { type: 'error', message: 'example.com was rejected. Reason: Incomplete listing information' },
                  { type: 'info', message: 'You have a new offer on example.com!' },
                ]
                const current = notifications[notificationIndex % notifications.length]
                if (current.type === 'success') {
                  showSuccess(current.message, settings.notificationDisplayTime * 1000)
                } else if (current.type === 'error') {
                  error(current.message, settings.notificationDisplayTime * 1000)
                } else {
                  info(current.message, settings.notificationDisplayTime * 1000)
                }
                setNotificationIndex(notificationIndex + 1)
              }}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Show Example Notification (Click to rotate)
            </button>
            <button
              onClick={() => {
                const bidTypes = [
                  { type: 'promoted', message: 'example.com - Asking Price $10,325' },
                  { type: 'promoted', message: 'example.com - Accepting Offers $10,325' },
                  { type: 'promoted', message: 'example.com - Current Bid $10,325' },
                  { type: 'info', message: 'example.com just listed by another user!' },
                ]
                const current = bidTypes[notificationIndex % bidTypes.length]
                if (current.type === 'promoted') {
                  showPromoted(
                    current.message,
                    settings.notificationDisplayTime * 1000,
                    {
                      label: 'View Listing',
                      onClick: () => window.location.href = '/'
                    }
                  )
                } else {
                  info(current.message, settings.notificationDisplayTime * 1000)
                }
                setNotificationIndex(notificationIndex + 1)
              }}
              className="w-full px-6 py-3 bg-yellow-500 text-yellow-900 rounded-lg hover:bg-yellow-600 transition font-medium font-semibold"
            >
              Show Bid/Listing Notification Example (Click to rotate)
            </button>
            <button
              onClick={() => {
                const userActions = [
                  'example.com has been approved!',
                  'example.com was rejected. Reason: Incomplete information',
                  'You have a new offer on example.com!',
                ]
                const current = userActions[notificationIndex % userActions.length]
                showUserAction(current, settings.notificationDisplayTime * 1000)
                setNotificationIndex(notificationIndex + 1)
              }}
              className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
            >
              Show User Action Notification Example (Click to rotate)
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {saving ? 'Saving...' : 'Save & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
