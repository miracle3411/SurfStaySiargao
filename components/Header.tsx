// components/Header.tsx - Main Navigation Header
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User, LogIn, UserPlus } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">🏄 SurfStay</span>
            <span className="ml-2 text-gray-600 hidden sm:inline">Siargao</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 transition-colors">
              Properties
            </Link>
            <Link href="/become-a-host" className="text-gray-700 hover:text-blue-600 transition-colors">
              Become a Host
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
            <Link
              href="/signup"
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/properties"
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Properties
              </Link>
              <Link
                href="/become-a-host"
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a Host
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="border-t pt-4 px-4 space-y-2">
                <Link
                  href="/login"
                  className="block text-center text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}