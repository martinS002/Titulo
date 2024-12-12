'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductoCard from './ProductosCard'
import Filtro from './Filtro'
import ProductoPreview from './ProductoPreview'

export default function ListaProductos({ addToCart }) {
  const [productos, setProductos] = useState([])
  const [filteredProductos, setFilteredProductos] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 8

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/`)
        if (response.ok) {
          const data = await response.json()
          setProductos(data)
          setFilteredProductos(data)
        } else {
          console.error('Failed to fetch products')
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProductos()
  }, [])

  useEffect(() => {
    const filtered = productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (categoryFilter === '' || producto.categoria === categoryFilter)
    )
    setFilteredProductos(filtered)
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, productos])

  const categories = Array.from(new Set(productos.map((producto) => producto.categoria)))

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProductos = filteredProductos.slice(indexOfFirstProduct, indexOfLastProduct)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const totalPages = Math.ceil(filteredProductos.length / productsPerPage)

  const handlePreview = (producto) => {
    setSelectedProduct(producto)
    setIsPreviewOpen(true)
  }

  return (
    <div>
      <Filtro
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {currentProductos.map((producto) => (
          <ProductoCard 
            key={producto.id} 
            producto={producto} 
            addToCart={addToCart} 
            onPreview={() => handlePreview(producto)}
          />
        ))}
      </motion.div>
      <div className="flex justify-center mt-8">
        {Array.from({ length: totalPages }, (_, index) => (
          <motion.button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`mx-1 px-4 py-2 rounded-full ${
              currentPage === index + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {index + 1}
          </motion.button>
        ))}
      </div>

      <ProductoPreview 
        producto={selectedProduct}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        addToCart={addToCart}
      />
    </div>
  )
}