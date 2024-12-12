// layout.jsx
'use client'

import "./globals.css"
import { useState, useEffect } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import { inter } from "./components/Fuentes"
import { usePathname } from "next/navigation"

export default function RootLayout({ children }) {
  const [supabase] = useState(() => createPagesBrowserClient())
  const pathname = usePathname()

  const hideLayout = ["/auth/login", "/auth/register", "/auth/resetpassword"]
  const shouldHideLayout = hideLayout.includes(pathname)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {})
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <html lang="en" className={`${inter.className} transition-colors duration-300`}>
      <body className="antialiased bg-white dark:bg-gray-800 text-black dark:text-white transition-colors duration-300">
        <SessionContextProvider supabaseClient={supabase}>
          <div id="root" className="flex flex-col min-h-screen bg-white dark:bg-gray-800 transition-colors duration-300">
            {!shouldHideLayout && <NavBar />}
            <main className="flex-grow bg-white dark:bg-gray-800 transition-colors duration-300">
              {children}
            </main>
            {!shouldHideLayout && <Footer />}
          </div>
        </SessionContextProvider>
      </body>
    </html>
  )
}