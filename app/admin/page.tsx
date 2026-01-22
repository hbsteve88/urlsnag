'use client'

import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import AdminDashboardV2 from '@/components/AdminDashboardV2'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      console.log('No user found, redirecting to home')
      router.push('/')
      return
    }

    console.log('User found, checking admin status for:', user.uid)

    const checkAdmin = async () => {
      try {
        console.log('Fetching user document from Firestore...')
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        
        console.log('User document fetch complete')
        console.log('Document exists:', userDoc.exists())
        
        if (!userDoc.exists()) {
          console.log('User document does not exist in Firestore')
          setChecking(false)
          router.push('/')
          return
        }

        const userData = userDoc.data()
        console.log('User data retrieved:', userData)
        console.log('User role:', userData?.role)
        console.log('Is admin?', userData?.role === 'admin')
        
        if (userData?.role === 'admin') {
          console.log('✓ Admin access GRANTED')
          setIsAdmin(true)
        } else {
          console.log('✗ Admin access DENIED - user role is:', userData?.role)
          router.push('/')
        }
        setChecking(false)
      } catch (error: any) {
        console.error('Error checking admin status:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          name: error.name
        })
        setChecking(false)
        router.push('/')
      }
    }

    checkAdmin()
  }, [user, loading])

  if (loading || checking || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {loading || checking ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </>
          ) : (
            <p className="text-gray-600">Redirecting...</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} isSignedIn={true} />
      <AdminDashboardV2 />
      <Footer />
    </main>
  )
}
