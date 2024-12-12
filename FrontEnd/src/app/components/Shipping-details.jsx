'use client'

import { useEffect, useState } from 'react'

export function ShippingDetails({ numeroPedido }) {
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pedidos/${numeroPedido}/detalles-envio/`)
        if (!response.ok) {
          throw new Error('No se pudo obtener los detalles del envío')
        }
        const data = await response.json()
        setDetails(data)
      } catch (err) {
        setError('Error al cargar los detalles del envío')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [numeroPedido])

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  if (!details) return <div>No se encontraron detalles</div>

  return (
    <div>
      <h2>Detalles del Pedido</h2>
      <div>
        <p><strong>Número de Pedido:</strong> {details.numero_pedido}</p>
        <p><strong>Estado:</strong> {details.estado}</p>
        <p><strong>Total:</strong> ${details.total}</p>
        <p><strong>Fecha de Creación:</strong> {new Date(details.creado_en).toLocaleString()}</p>
      </div>

      {details.envio && (
        <div>
          <h3>Detalles del Envío</h3>
          <p><strong>Número de Orden:</strong> {details.envio.numero_orden}</p>
          <p><strong>Referencia:</strong> {details.envio.referencia}</p>
          <p><strong>Costo de Envío:</strong> ${details.envio.costo}</p>
        </div>
      )}

      <h3>Items del Pedido</h3>
      <table>
        <thead>
          <tr>
            <th>ID Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {details.items.map((item) => (
            <tr key={item.id_producto}>
              <td>{item.id_producto}</td>
              <td>{item.cantidad}</td>
              <td>${item.precio}</td>
              <td>${item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

