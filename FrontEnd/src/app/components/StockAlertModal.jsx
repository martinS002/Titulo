import { useState, useEffect } from 'react'
import { AlertTriangle, X, TruckIcon } from 'lucide-react'
import Link from 'next/link'

export default function StockAlertModal({ onClose }) {
  const [lowStockProducts, setLowStockProducts] = useState([])

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const products = await response.json()
        const lowStock = products.filter(product => product.stock <= product.stock_minimo)
        setLowStockProducts(lowStock)
      } catch (error) {
        console.error('Error fetching low stock products:', error)
      }
    }

    fetchLowStockProducts()
  }, [])

  if (lowStockProducts.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <h2 className="text-lg font-semibold">Alerta de Stock Bajo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Los siguientes productos están por debajo del stock mínimo:
        </p>
        
        <ul className="space-y-2 mb-6">
          {lowStockProducts.map(product => (
            <li key={product.id}>
              {product.nombre} - Stock actual: {product.stock} (Mínimo: {product.stock_minimo})
            </li>
          ))}
        </ul>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors duration-200 font-medium"
          >
            Entendido
          </button>
          <Link href="/proveedores" className="w-full">
            <button className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-300 transition-colors duration-200 font-medium flex items-center justify-center">
              <TruckIcon className="mr-2 h-5 w-5" />
              Ir a Proveedores
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

