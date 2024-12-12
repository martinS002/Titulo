'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import ListaProductos from '../components/ListaProductos'
import Carrito from '../components/Carrito'
import { filterProductData, saveCartToStorage, loadCartFromStorage } from '../../utils/cart-helpers'

export default function EcommercePage() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCartAnimating, setIsCartAnimating] = useState(false)

  // Cargar el carrito al iniciar
  useEffect(() => {
    const savedCart = loadCartFromStorage()
    if (savedCart.length > 0) {
      setCart(savedCart)
    }
  }, [])

  const addToCart = (product) => {
    const filteredProduct = filterProductData(product)
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === filteredProduct.id)
      const newCart = existingItem
        ? prevCart.map((item) =>
            item.id === filteredProduct.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, filteredProduct]
      
      // Guardar en localStorage después de actualizar
      saveCartToStorage(newCart)
      return newCart
    })
    setIsCartAnimating(true)
    setTimeout(() => setIsCartAnimating(false), 3000)
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== productId)
      saveCartToStorage(newCart)
      return newCart
    })
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
      saveCartToStorage(newCart)
      return newCart
    })
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      <header className="bg-white shadow-md bg-orange-500 dark:bg-gray-700 text-gray-800">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Nuestros Servicios</h1>
          <motion.button
            onClick={() => setIsCartOpen(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={20} />
            <span>Carrito ({cartItemCount})</span>
          </motion.button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <ListaProductos addToCart={addToCart} />
      </main>
      <AnimatePresence>
        {isCartOpen && (
          <Carrito
            isOpen={isCartOpen}
            setIsOpen={setIsCartOpen}
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCartAnimating && (
          <motion.div
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            Producto añadido al carrito
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

