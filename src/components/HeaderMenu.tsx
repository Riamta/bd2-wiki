"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Menu, User, LogOut, LogIn, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

export default function HeaderMenu() {
  const pathname = usePathname()
  const isCharacterPage = pathname?.startsWith("/character/")
  const [tierOpen, setTierOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const tierRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isLoading } = useAuth()

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tierRef.current && !tierRef.current.contains(e.target as Node)) {
        setTierOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (tierOpen || userMenuOpen) {
      document.addEventListener("mousedown", handleClick)
    }
    return () => document.removeEventListener("mousedown", handleClick)
  }, [tierOpen, userMenuOpen])

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
  }

  if (isCharacterPage) return null

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm shadow-2xl border-b border-gray-800 transition-all duration-300 opacity-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and main buttons container */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-white">Brown Dust 2 Wiki</h1>
              </Link>
            </div>

            {/* Character and Costume buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-2 ml-8">
              <Link
                href="/characters"
                className={`px-4 py-2 rounded-md text-lg font-bold transition-colors ${
                  pathname === "/characters" || pathname?.startsWith("/character/")
                    ? "text-green-400"
                    : "text-white"
                }`}
              >
                Characters
              </Link>
              <Link
                href="/costumes"
                className={`px-4 py-2 rounded-md text-lg font-bold transition-colors ${
                  pathname === "/costumes" || pathname?.startsWith("/costume/")
                    ? "text-green-400"
                    : "text-white"
                }`}
              >
                Costumes
              </Link>
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {/* Tier Lists Dropdown */}
              <div className="relative" ref={tierRef}>
                <button
                  className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    tierOpen
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white"
                  }`}
                  onClick={() => setTierOpen(!tierOpen)}
                  aria-haspopup="true"
                  aria-expanded={tierOpen}
                >
                  <span>Tier Lists</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${tierOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {tierOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        href="/tierlist"
                        className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 hover:text-white transition-colors"
                        onClick={() => setTierOpen(false)}
                      >
                        PvE Tier List
                      </Link>
                      <Link
                        href="/tierlist-pvp"
                        className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 hover:text-white transition-colors"
                        onClick={() => setTierOpen(false)}
                      >
                        PvP Tier List
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Codes Button */}
              <Link
                href="/codes"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-md text-sm font-medium transition-colors"
              >
                Codes
              </Link>

              {/* Authentication Section */}
              {!isLoading && (
                <>
                  {user ? (
                    <div className="relative" ref={userMenuRef}>
                      <button
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          userMenuOpen
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white"
                        }`}
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        aria-haspopup="true"
                        aria-expanded={userMenuOpen}
                      >
                        <User className="w-4 h-4" />
                        <span>{user.username}</span>
                        {user.role === 'admin' && <Shield className="w-3 h-3 text-yellow-400" />}
                        <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* User Dropdown Menu */}
                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-50">
                          <div className="py-1">
                            <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-600">
                              {user.email}
                              <br />
                              <span className="capitalize">{user.role}</span>
                            </div>
                            {user.role === 'admin' && (
                              <Link
                                href="/dashboard"
                                className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 hover:text-white transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <Shield className="w-4 h-4 inline mr-2" />
                                Dashboard
                              </Link>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 hover:text-white transition-colors"
                            >
                              <LogOut className="w-4 h-4 inline mr-2" />
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/characters"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/characters" || pathname?.startsWith("/character/")
                  ? "bg-green-600 text-white"
                  : "text-slate-200 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Characters
            </Link>
            <Link
              href="/costumes"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/costumes" || pathname?.startsWith("/costume/")
                  ? "bg-green-600 text-white"
                  : "text-slate-200 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Costumes
            </Link>

            {/* Mobile Tier Lists */}
            <div className="pt-2 border-t border-slate-700">
              <Link
                href="/tierlist"
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                PvE Tier List
              </Link>
              <Link
                href="/tierlist-pvp"
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                PvP Tier List
              </Link>
            </div>

            {/* Mobile Codes */}
            <Link
              href="/codes"
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Codes
            </Link>

            {/* Mobile Authentication */}
            {!isLoading && (
              <div className="pt-2 border-t border-slate-700">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-slate-400">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{user.username}</span>
                        {user.role === 'admin' && <Shield className="w-3 h-3 text-yellow-400" />}
                      </div>
                      <div className="text-xs mt-1">{user.email}</div>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-blue-400 hover:bg-slate-700 hover:text-blue-300 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4 inline mr-2" />
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
