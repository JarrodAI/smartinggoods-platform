'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Sun, Moon, ChevronDown } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm bg-transparent py-5">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 relative z-10">
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Smarting Goods
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <nav className="relative z-10 flex max-w-max flex-1 items-center justify-center">
              <ul className="group flex flex-1 list-none items-center justify-center space-x-1">
                <li className="relative">
                  <button 
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    onMouseEnter={() => setSolutionsOpen(true)}
                    onMouseLeave={() => setSolutionsOpen(false)}
                  >
                    Solutions
                    <ChevronDown className={`relative top-[1px] ml-1 h-3 w-3 transition duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {solutionsOpen && (
                    <div 
                      className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                      onMouseEnter={() => setSolutionsOpen(true)}
                      onMouseLeave={() => setSolutionsOpen(false)}
                    >
                      <Link href="/services/web-design" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Website Design</Link>
                      <Link href="/services/web-development" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Website Development</Link>
                      <Link href="/services/online-marketing" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Online Marketing</Link>
                      <Link href="/services/ai-social-media" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">AI Social Media</Link>
                      <Link href="/services/domain-names" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Domain Names</Link>
                      <Link href="/services/hosting" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Hosting Services</Link>
                    </div>
                  )}
                </li>
                <li>
                  <Link 
                    href="/templates"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50"
                  >
                    Templates
                  </Link>
                </li>
                <li className="relative">
                  <button 
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    onMouseEnter={() => setCompanyOpen(true)}
                    onMouseLeave={() => setCompanyOpen(false)}
                  >
                    Company
                    <ChevronDown className={`relative top-[1px] ml-1 h-3 w-3 transition duration-200 ${companyOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {companyOpen && (
                    <div 
                      className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                      onMouseEnter={() => setCompanyOpen(true)}
                      onMouseLeave={() => setCompanyOpen(false)}
                    >
                      <Link href="/about" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">About Us</Link>
                      <Link href="/portfolio" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Portfolio</Link>
                      <Link href="/blog" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Blog</Link>
                      <Link href="/careers" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Careers</Link>
                    </div>
                  )}
                </li>
                <li>
                  <Link 
                    href="/contact"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 hidden md:flex">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex gap-4 items-center">
                <Link href="/auth/signin">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden relative z-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}