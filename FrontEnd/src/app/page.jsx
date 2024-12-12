'use client'

import { useEffect, useState } from "react"
import { supabase } from './libs/supabaseClient'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Package, ShoppingBag, Users, Phone } from 'lucide-react'
import Link from 'next/link'


export default function EcommercePage() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace('auth/login')
      }
    })

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [router])

  const features = [
    { icon: ShoppingBag, title: "Tienda", description: "Explora nuestra colección", link:"/tienda" },
    { icon: Users, title: "Nosotros", description: "Conoce nuestro equipo",link:"/nosotros" },
    { icon: Phone, title: "Contactos", description: "Estamos para ayudarte",link:"/contactos" },
  ]

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-700 from-orange-50 to-white overflow-hidden">
    
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <Package className="h-16 w-16 text-orange-500" />
          </motion.div>
          <h1  className="text-6xl font-bold text-gray-900 mb-6 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            Bienvenido a 
            <span className="text-orange-500"> StockLiteEasy
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            Descubre una experiencia de compra única con los mejores productos y servicios
          </p>
        </motion.div>


        <div className="grid md:grid-cols-3 gap-8 mb-20 ">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Link href={feature.link} passHref>
              <div className="p-6 h-full bg-white/80 backdrop-blur border border-orange-100 hover:border-orange-200 transition-colors rounded-lg shadow-sm dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-orange-100 rounded-lg mb-4 dark:bg-gray-700">
                    <feature.icon className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{feature.title}</h3>
                  <p className="text-gray-600 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{feature.description}</p>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>

   
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-full text-lg font-semibold inline-flex items-center transition-colors duration-300"
            onClick={() => router.push('/tienda')}
          >
            Explorar Ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}