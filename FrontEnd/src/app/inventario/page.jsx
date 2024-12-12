'use client'

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import Image from 'next/image'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import StockAlertModal from '../components/StockAlertModal'

export default function InventarioProductos() {
  const router = useRouter()
  const [productos, setProductos] = useState([])
  const [editandoProducto, setEditandoProducto] = useState(null)
  const [codigoProducto, setCodigoProducto] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precioCompra, setPrecioCompra] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [stock, setStock] = useState(0)
  const [stockMinimo, setStockMinimo] = useState(0)
  const [categoria, setCategoria] = useState('')
  const [imagen, setImagen] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showStockAlert, setShowStockAlert] = useState(true)
  const itemsPerPage = 6

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/`)
    const data = await res.json()
    setProductos(data)
  }

  const handleImageChange = (e) => {
    setImagen(e.target.files[0]) 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("codigo_producto", codigoProducto)
    formData.append("nombre", nombre)
    formData.append("descripcion", descripcion)
    formData.append("precio_compra", precioCompra)
    formData.append("precio_venta", precioVenta)
    formData.append("stock", stock)
    formData.append("stock_minimo", stockMinimo)
    formData.append("categoria", categoria)

    if (imagen) {
      formData.append("imagen", imagen) 
    }

    const url = editandoProducto
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/${editandoProducto.id}/`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/`
    const method = editandoProducto ? "PUT" : "POST"

    const res = await fetch(url, {
      method: method,
      body: formData,
    })

    const data = await res.json()

    if (res.ok) {
      router.refresh()
      resetForm()
      fetchProductos()
    } else {
      console.error('Error al agregar/editar el producto', data)
    }
  }

  const resetForm = () => {
    setCodigoProducto('')
    setNombre('')
    setDescripcion('')
    setPrecioCompra('')
    setPrecioVenta('')
    setStock(0)
    setStockMinimo(0)
    setCategoria('')
    setImagen(null)
    setEditandoProducto(null)
  }

  const editarProducto = (producto) => {
    setEditandoProducto(producto)
    setCodigoProducto(producto.codigo_producto)
    setNombre(producto.nombre)
    setDescripcion(producto.descripcion)
    setPrecioCompra(producto.precio_compra)
    setPrecioVenta(producto.precio_venta)
    setStock(producto.stock)
    setStockMinimo(producto.stock_minimo)
    setCategoria(producto.categoria)
  }

  const eliminarProducto = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/${id}/`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchProductos()
      } else {
        console.error('Error al eliminar el producto')
      }
    }
  }

  const totalPages = Math.ceil(productos.length / itemsPerPage)
  const indexStart = (currentPage - 1) * itemsPerPage
  const indexEnd = indexStart + itemsPerPage
  const currentProductos = productos.slice(indexStart, indexEnd)

  return (
    <>
      {showStockAlert && <StockAlertModal onClose={() => setShowStockAlert(false)} />}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="md:w-1/3 mb-8 md:mb-0 md:mr-8">
        <h1 className="text-3xl font-bold my-6">Inventario</h1>
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 transition-all duration-300 hover:shadow-xl dark:bg-gray-700 dark:text-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">
              {editandoProducto ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="codigoProducto" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Código del Producto</label>
                <input
                  id="codigoProducto"
                  type="text"
                  value={codigoProducto}
                  onChange={(e) => setCodigoProducto(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Descripción</label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="precioCompra" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Precio de Compra</label>
                  <input
                    id="precioCompra"
                    type="number"
                    step="0.01"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="precioVenta" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Precio de Venta</label>
                  <input
                    id="precioVenta"
                    type="number"
                    step="0.01"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Stock</label>
                  <input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stockMinimo" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Stock Mínimo</label>
                  <input
                    id="stockMinimo"
                    type="number"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Categoría</label>
                <input
                  id="categoria"
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">Imagen del Producto</label>
                <input
                  id="imagen"
                  type="file"
                  onChange={handleImageChange} 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 dark:bg-gray-600 dark:text-white"
                  accept="image/*"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="submit"
                className="flex items-center justify-center w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                <Check size={16} className="mr-2" />
                {editandoProducto ? 'Actualizar Producto' : 'Agregar Producto'}
              </button>
              {editandoProducto && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center ml-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white"
                >
                  <X size={16} className="mr-2" />
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="md:w-2/3">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 dark:text-white">Lista de Productos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProductos.map((producto) => (
              <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-700">
                <Image
                  src={producto.imagen || "/placeholder.svg"}
                  alt={producto.nombre || "Producto sin nombre"}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 dark:text-white">{producto.nombre}</h2>
                  <p className="text-gray-600 mb-4 dark:text-gray-300">{producto.descripcion}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold dark:text-white">
                      ${parseFloat(producto.precio_venta).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Stock: {producto.stock} / Mínimo: {producto.stock_minimo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <button 
                      onClick={() => editarProducto(producto)}
                      className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                    >
                      <Pencil size={16} />
                      <span className="sr-only">Editar</span>
                    </button>
                    <button 
                      onClick={() => eliminarProducto(producto.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span className="sr-only">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 bg-gray-300 rounded dark:bg-gray-600 dark:text-white"
            >
              Prev
            </button>
            <span className="px-3 py-1 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 mx-1 bg-gray-300 rounded dark:bg-gray-600 dark:text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  )
}