'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Menu, X, LogOut, Moon, Sun } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import NotificacionesStock from '../components/Stock-notifications'
import { isAdminEmail } from '../utils/roles'

const adminMenuItems = [
  { name: 'Inicio', href: '/' },
  { name: 'Inventario', href: '/inventario' },
  { 
    name: 'Ventas', 
    href: '#', 
    children: [
      { name: 'Ventas', href: '/ventas' },
      { name: 'Detalles Venta', href: '/ventas/detallesventas' },
    ],
  },
  { 
    name: 'Tienda', 
    href: '#', 
    children: [
      { name: 'Tienda', href: '/tienda' },
      { name: 'Detalles de ventas', href: '/tienda/envios' },
    ],
  },
  { name: 'Proveedores', href: '/proveedores' },
  { name: 'Nosotros', href: '/nosotros' },
  { 
    name: 'Contactos', 
    href: '#', 
    children: [
      { name: 'Contactos', href: '/contactos' },
      { name: 'Detalles contactos', href: '/contactos/contactosclientes' },
    ],
  },
  { name: 'Tareas', href: '/tareas' },
]

const userMenuItems = [
  { name: 'Inicio', href: '/' },
  { name: 'Tienda', href: '/tienda' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Contactos', href: '/contactos' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState(null) // Controla el submenú activo
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuItems, setMenuItems] = useState(userMenuItems)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    let mounted = true

    const updateUserState = (session) => {
      if (!mounted) return
      if (session?.user) {
        const isAdmin = isAdminEmail(session.user.email)
        setIsAdmin(isAdmin)
        setMenuItems(isAdmin ? adminMenuItems : userMenuItems)
      } else {
        setIsAdmin(false)
        setMenuItems(userMenuItems)
      }
      setIsLoading(false)
    }

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      updateUserState(session)

      supabase.auth.onAuthStateChange((_event, session) => {
        updateUserState(session)
      })
    }

    initializeAuth()

    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }

    return () => {
      mounted = false
    }
  }, [supabase])

  const handleLogout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    }

    window.location.href = '/auth/login'
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index) // Alterna el submenú activo
  }

  if (isLoading) {
    return <div className="bg-orange-500 dark:bg-gray-800 h-16"></div>
  }

  return (
    <nav className="bg-orange-500 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <motion.img 
            src="/Logo.png" 
            className="h-16" 
            alt="Logo"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
          <motion.span 
            className="text-2xl font-semibold text-white group-hover:text-yellow-300 transition-colors duration-300 dark:text-gray-200 dark:group-hover:text-yellow-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            StockLiteEasy
          </motion.span>
        </Link>
        <div className="relative flex-grow flex justify-center">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 pl-10 w-64 bg-white bg-opacity-20 text-white placeholder-gray-200 rounded-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all duration-300 focus:w-80 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-gray-200"
          />
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && <NotificacionesStock />}
          <button
            onClick={toggleDarkMode}
            className="text-white hover:text-yellow-300 transition duration-300 dark:text-gray-200 dark:hover:text-yellow-500"
          >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
          <motion.button
            className="text-white hover:text-yellow-300 transition duration-300 dark:text-gray-200 dark:hover:text-yellow-500"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-8 w-8" />
            ) : (
              <Menu className="h-8 w-8" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.children ? (
                  <>
                    <span
                      className="block px-4 py-2 text-orange-800 hover:bg-orange-100 cursor-pointer transition duration-300 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => toggleSubmenu(index)}
                    >
                      {item.name}
                    </span>
                    {activeSubmenu === index && (
                      <div className="ml-4">
                        {item.children.map((child) => (
                          <Link 
                            key={child.name} 
                            href={child.href}
                            onClick={() => {
                              setActiveSubmenu(null); // Cierra el submenú actual
                              setIsMenuOpen(false); // Cierra todo el menú
                            }}
                          >
                            <span className="block px-4 py-2 text-orange-600 hover:bg-orange-100 cursor-pointer transition duration-300 dark:text-gray-400 dark:hover:bg-gray-600">
                              {child.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)} // Cierra el menú principal
                  >
                    <span
                      className="block px-4 py-2 text-orange-800 hover:bg-orange-100 cursor-pointer transition duration-300 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {item.name}
                    </span>
                  </Link>
                )}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: menuItems.length * 0.1 }}
            >
              <span 
                className="block px-4 py-2 text-orange-800 hover:bg-orange-100 cursor-pointer transition duration-300 flex items-center dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

