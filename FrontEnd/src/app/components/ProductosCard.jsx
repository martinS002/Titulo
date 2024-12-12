import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'

export default function ProductosCard({ 
  producto, 
  addToCart,
  onPreview,
  esVistaInventario = false 
}) {
  const precio = producto && producto.precio_venta ? parseFloat(producto.precio_venta) : NaN
  const precioFormateado = isNaN(precio) ? 'Precio no disponible' : precio

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105 dark:bg-gray-700 text-gray-800 dark:text-gray-200 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <Image
          src={producto?.imagen || "/placeholder.svg"}
          alt={producto?.nombre || "Producto sin nombre"}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{producto?.nombre || "Producto sin nombre"}</h2>
        <div className="flex justify-between items-center dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <span className="text-2xl font-bold text-orange-500 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            ${precioFormateado}
          </span>
          <div className="flex space-x-2">
            {!esVistaInventario && (
              <motion.button 
                className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addToCart(producto)}
              >
                <ShoppingCart size={20} />
              </motion.button>
            )}
            <motion.button 
              className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPreview(producto)}
            >
              <Eye size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}