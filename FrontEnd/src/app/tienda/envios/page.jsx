'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Head from 'next/head'

export default function EnviosPage() {
  const [pedidos, setPedidos] = useState([])
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 10

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pedidos/lista/?page=${currentPage}&limit=${itemsPerPage}`
        )
        if (!response.ok) {
          throw new Error('Error al cargar los pedidos')
        }
        const data = await response.json()
        setPedidos(data.results || data)
        setTotalPages(data.total_pages || Math.ceil(data.count / itemsPerPage))
      } catch (err) {
        setError('Error al cargar los pedidos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPedidos()
  }, [currentPage])

  const fetchPedidoDetails = async (numeroPedido) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pedidos/${numeroPedido}/detalles-envio/`
      )
      if (!response.ok) {
        throw new Error('No se pudo obtener los detalles del envío')
      }
      const data = await response.json()
      
      const itemsWithNames = await Promise.all(
        data.items.map(async (item) => {
          const productResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/${item.id_producto}/`
          )
          if (productResponse.ok) {
            const productData = await productResponse.json()
            return { ...item, nombre_producto: productData.nombre }
          }
          return { ...item, nombre_producto: 'Producto no encontrado' }
        })
      )
      
      setSelectedPedido({ ...data, items: itemsWithNames })
    } catch (err) {
      setError('Error al cargar los detalles del envío')
    }
  }

  const handlePageChange = (page) => {
    window.history.pushState({}, '', `/tienda/envios?page=${page}`)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page.toString())
    window.history.pushState({}, '', `?${newParams.toString()}`)
  }

  if (isLoading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
  </div>
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong className="font-bold">Error:</strong>
    <span className="block sm:inline"> {error}</span>
  </div>

  return (
    <div className="container mx-auto p-4 bg-white">
      <Head>
        <title>Envíos</title>
      </Head>
      <h1 className="text-5xl font-extrabold mb-8  text-center">
        <span className="bg-clip-text  ">
          Gestión de Envíos
        </span>
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 ">Lista de Pedidos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-orange-500 text-white">
                  <th className="border p-3 text-left">Número de Pedido</th>
                  <th className="border p-3 text-left">Estado</th>
                  <th className="border p-3 text-left">Total</th>
                  <th className="border p-3 text-left">Fecha</th>
                  <th className="border p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.numero_pedido} className="hover:bg-gray-100 transition-colors duration-200">
                    <td className="border p-3">{pedido.numero_pedido}</td>
                    <td className="border p-3">{pedido.estado}</td>
                    <td className="border p-3">${pedido.total}</td>
                    <td className="border p-3">
                      {new Date(pedido.creado_en).toLocaleDateString()}
                    </td>
                    <td className="border p-3">
                      <button 
                        onClick={() => fetchPedidoDetails(pedido.numero_pedido)}
                        className="text-orange-500 hover:text-black underline font-medium"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors duration-200"
            >
              Anterior
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`mx-1 px-4 py-2 border rounded transition-colors duration-200
                  ${currentPage === index + 1 ? 'bg-orange-500 text-white' : 'bg-white text-orange-500 hover:bg-orange-100'}`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors duration-200"
            >
              Siguiente
            </button>
          </div>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 ">Detalles del Pedido</h2>
          {selectedPedido ? (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-orange-500">Pedido #{selectedPedido.numero_pedido}</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <p><strong className="text-black">Estado:</strong> {selectedPedido.estado}</p>
                <p><strong className="text-black">Total:</strong> ${selectedPedido.total}</p>
                <p><strong className="text-black">Fecha de Creación:</strong> {new Date(selectedPedido.creado_en).toLocaleString()}</p>
              </div>
              
              {selectedPedido.envio && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-orange-600">Detalles del Envío</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <p><strong className="text-black">Número de Orden:</strong> {selectedPedido.envio.numero_orden}</p>
                    <p><strong className="text-black">Referencia:</strong> {selectedPedido.envio.referencia}</p>
                    <p><strong className="text-black">Costo de Envío:</strong> ${selectedPedido.envio.costo}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold mb-4 text-orange-600">Items del Pedido</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border-collapse">
                    <thead>
                      <tr className="bg-orange-500 text-white">
                        <th className="border p-2 text-left">ID Producto</th>
                        <th className="border p-2 text-left">Nombre Producto</th>
                        <th className="border p-2 text-left">Cantidad</th>
                        <th className="border p-2 text-left">Precio</th>
                        <th className="border p-2 text-left">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedido.items.map((item) => (
                        <tr key={item.id_producto} className="hover:bg-gray-100">
                          <td className="border p-2">{item.id_producto}</td>
                          <td className="border p-2">{item.nombre_producto}</td>
                          <td className="border p-2">{item.cantidad}</td>
                          <td className="border p-2">${item.precio}</td>
                          <td className="border p-2">${item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600 italic">Selecciona un pedido para ver sus detalles.</p>
          )}
        </div>
      </div>
    </div>
  )
}

