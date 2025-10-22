import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { Menu, X, Home, Scan, User, BarChart3, Settings, TrendingUp, Book, LogIn, UserPlus, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthContext } from '../auth/AuthContext'
import logoUrl from '../assets/logo.svg'

export default function Navbar() {
  const { isSignedIn, user, signIn, signOut } = useAuthContext()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    ...(isSignedIn ? [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
      { name: 'Scan', href: '/scan', icon: Scan },
      { name: 'Analytics', href: '/analytics', icon: TrendingUp },
      { name: 'Care Guides', href: '/care-guides', icon: Book },
      { name: 'Preferences', href: '/preferences', icon: Settings },
    ] : [])
  ]

  const isActive = (path) => location.pathname === path

  // Check if we're using fallback auth (demo mode)
  const isFallbackAuth = signIn !== undefined

  const renderAuthButtons = () => {
    if (isSignedIn) {
      if (isFallbackAuth) {
        // Fallback user display
        return (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName || 'Demo User'}
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )
      } else {
        // Clerk user button
        return (
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
                userButtonPopoverCard: "bg-white shadow-lg border border-gray-200",
              }
            }}
          />
        )
      }
    } else {
      if (isFallbackAuth) {
        // Fallback sign in button
        return (
          <div className="flex items-center space-x-3">
            <button
              onClick={signIn}
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span>Demo Sign In</span>
            </button>
            <button
              onClick={signIn}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center space-x-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          </div>
        )
      } else {
        // Clerk sign in buttons
        return (
          <div className="flex items-center space-x-3">
            <SignInButton mode="modal">
              <button className="text-gray-600 hover:text-primary-600 font-medium">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow">
                Get Started
              </button>
            </SignUpButton>
          </div>
        )
      }
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.img 
              src={logoUrl} 
              alt="Dog Breed Identification" 
              className="h-8 w-8 filter drop-shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Dog Breed Identification
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-pink-100"
          >
            <div className="px-4 py-3 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Auth */}
              <div className="pt-3 border-t border-gray-200">
                {isSignedIn ? (
                  isFallbackAuth ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {user?.firstName || 'Demo User'}
                        </span>
                      </div>
                      <button
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 font-medium flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <UserButton />
                      <span className="text-sm text-gray-600">Account</span>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    {isFallbackAuth ? (
                      <>
                        <button
                          onClick={signIn}
                          className="w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 font-medium flex items-center space-x-2"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Demo Sign In</span>
                        </button>
                        <button
                          onClick={signIn}
                          className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-2 rounded-lg font-medium flex items-center space-x-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Get Started</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <SignInButton mode="modal">
                          <button className="w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 font-medium">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-2 rounded-lg font-medium">
                            Get Started
                          </button>
                        </SignUpButton>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
