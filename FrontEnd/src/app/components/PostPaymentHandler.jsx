'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createTransportOrder } from '../libs/chilexpress-service'

export default function PostPaymentHandler() {
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const router = useRouter()
  const processedRef = useRef(false)

  useEffect(() => {
    const handlePostPayment = async () => {
      // Evitar procesamiento duplicado
      if (processedRef.current) {
        console.log('Proceso ya ejecutado, evitando duplicación');
        return;
      }

      try {
        processedRef.current = true;
        console.log('Iniciando proceso de post-pago');
        // Get the token_ws from the URL
        const urlParams = new URLSearchParams(window.location.search)
        const token_ws = urlParams.get('token_ws')

        if (!token_ws) {
          throw new Error('No se encontró el token de la transacción')
        }

        console.log('Token obtenido:', token_ws);

        // Retrieve shipping data and cart info from localStorage
        const shippingDataString = localStorage.getItem('pendingShippingData')
        const cartDataString = localStorage.getItem('pendingCartData')

        if (!shippingDataString || !cartDataString) {
          throw new Error('No se encontraron datos de envío o del carrito')
        }

        const shippingData = JSON.parse(shippingDataString)
        const cartData = JSON.parse(cartDataString)

        console.log('Datos de envío:', shippingData);
        console.log('Datos del carrito:', cartData);

        // Confirm the transaction first
        console.log('Confirmando transacción...');
        const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/confirm-transaction/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            token_ws,
            cartData: cartData.cart,
            totalAmount: cartData.totalAmount
          }),
        });

        const confirmData = await confirmResponse.json();
        console.log('Respuesta de confirmación:', confirmData);

        if (!confirmResponse.ok) {
          console.error('Error al confirmar la transacción:', confirmData);
          throw new Error(confirmData.error || 'Error al confirmar la transacción');
        }

        if (confirmData.status !== 'AUTHORIZED') {
          throw new Error('La transacción no fue autorizada');
        }

        // Create transport order
        console.log('Creando orden de transporte...');
        const shippingResult = await createTransportOrder(shippingData)
        console.log('Orden de envío generada:', shippingResult)

        if (!shippingResult || !shippingResult.orderNumber || !shippingResult.reference) {
          console.error('Respuesta incompleta de createTransportOrder:', shippingResult);
          throw new Error('Error al generar la orden de envío: Respuesta incompleta')
        }

        const transportOrderNumber = shippingResult.orderNumber
        const shippingReference = shippingResult.reference

        // Generate unique order number
        const orderNumber = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Update order in backend
        console.log('Actualizando orden en el backend...');
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/actualizar-pedido/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pendingCartData: JSON.stringify({
              cart: cartData.cart,
              totalAmount: cartData.totalAmount,
              shippingCost: cartData.shippingCost
            }),
            pendingShippingData: shippingDataString,
            transactionDetails: {
              ...confirmData,
              buy_order: orderNumber,
              transaction_id: confirmData.transactionId || confirmData.token
            },
            shippingOrder: transportOrderNumber,
            shippingReference: shippingReference
          }),
        })

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json()
          console.error('Error al actualizar la orden en el backend:', errorData);
          throw new Error(errorData.error || 'Error al actualizar la orden en el backend')
        }

        const orderUpdateResult = await updateResponse.json()
        console.log('Respuesta de actualización de orden:', orderUpdateResult);
        
        if (!orderUpdateResult.orderNumber || !orderUpdateResult.total) {
          throw new Error('Respuesta incompleta del servidor al actualizar la orden')
        }

        setOrderDetails({
          orderNumber: orderUpdateResult.orderNumber,
          total: orderUpdateResult.total
        })
        
        setStatus('success')
        
        // Clear the pending data
        localStorage.removeItem('pendingShippingData')
        localStorage.removeItem('pendingCartData')
        
      
      } catch (error) {
        console.error('Error en el proceso post-pago:', error)
        console.error('Detalles adicionales:', error.stack)
        setStatus('error')
        setError(error instanceof Error ? error.message : 'Error desconocido')
        processedRef.current = false; // Permitir reintentar en caso de error
      }
    }

    handlePostPayment()
  }, [router])

  if (status === 'processing') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Procesando su orden...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }
  
  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-600">Por favor, contacte a soporte.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">¡Gracias por su compra!</h2>
        <p className="text-gray-600">Su orden ha sido procesada exitosamente.</p>
        {orderDetails && (
          <div className="mt-4 space-y-2">
            <p className="font-medium">Número de orden: <span className="text-blue-600">{orderDetails.orderNumber}</span></p>
            <p className="font-medium">Total: <span className="text-green-600">${parseFloat(orderDetails.total).toLocaleString()}</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

