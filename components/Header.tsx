'use client'

import { Menu, X, Search, LogOut, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'
import AuthModal from './AuthModal'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  showSearchBar?: boolean
  isSignedIn?: boolean
}

export default function Header({
  searchQuery,
  onSearchChange,
  showSearchBar = false,
  isSignedIn = false,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    const checkAdminStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        setIsAdmin(userData?.role === 'admin')
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  const handleLogoClick = () => {
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={handleLogoClick} className="flex items-center hover:opacity-80 transition">
            <img src="/urlsnaglogo.svg" alt="URLSNAG" className="h-12 w-auto" />
          </button>

          {showSearchBar && (
            <div className="hidden md:flex flex-1 mx-8">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          <nav className="hidden lg:flex items-center gap-3">
            <button onClick={handleLogoClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Browse
            </button>
            <Link href="/sell" className="px-4 py-2 bg-[#7299CB] text-white rounded-lg hover:bg-[#5a7aaa] transition font-medium">
              Sell
            </Link>
            {user && (
              <>
                <Link href="/my-domains" className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium">
                  My Domains
                </Link>
                <Link href="/settings" className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium" style={{ backgroundColor: '#EFF6FF', color: '#1F2937', border: '1px solid #D1E0F5' }}>
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-[#747475] text-white rounded-lg hover:bg-[#5a5a5c] transition font-medium">
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
            {!user && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
              >
                Sign In
              </button>
            )}
          </nav>

          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden pb-4 space-y-2">
            {showSearchBar && (
              <div className="px-4 py-2">
                <input
                  type="text"
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
            <button
              onClick={handleLogoClick}
              className="block w-full px-4 py-2 border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg font-medium text-left"
            >
              Browse
            </button>
            <Link
              href="/sell"
              className="block px-4 py-2 bg-[#7299CB] text-white hover:bg-[#5a7aaa] rounded-lg font-medium"
            >
              Sell
            </Link>
            {user && (
              <>
                <Link
                  href="/my-domains"
                  className="block px-4 py-2 border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
                >
                  My Domains
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </div>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="block px-4 py-2 bg-[#747475] text-white rounded-lg hover:bg-[#5a5a5c] font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                      Admin
                    </div>
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
            {!user && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
              >
                Sign In
              </button>
            )}
          </nav>
        )}

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </header>
  )
}
