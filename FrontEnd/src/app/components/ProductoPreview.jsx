'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import Image from 'next/image'

export default function ProductoPreview({ producto, isOpen, onClose, addToCart }) {
  if (!producto) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Image
                src={producto.imagen || "/placeholder.svg"}
                alt={producto.nombre || "Producto sin nombre"}
                width={800}
                height={400}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={onClose}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">{producto.nombre}</h2>
              <p className="text-gray-600 mb-4">{producto.descripcion}</p>
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold text-orange-500">
                  ${parseFloat(producto.precio_venta)}
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 mr-2">Categoría:</span>
                  <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">{producto.categoria}</span>
                </div>
                {producto.marca && (
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 mr-2">Marca:</span>
                    <span>{producto.marca}</span>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors"
                onClick={() => {
                  addToCart(producto)
                  onClose()
                }}
              >
                <ShoppingCart size={20} />
                <span>Añadir al carrito</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}