'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function TransbankResult() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const confirmationAttempted = useRef(false)

  useEffect(() => {
    const token_ws = searchParams.get('token_ws')
    const tbk_token = searchParams.get('TBK_TOKEN')
    
    if (token_ws && !confirmationAttempted.current) {
      confirmationAttempted.current = true
      confirmTransaction(token_ws)
    } else if (tbk_token) {
      setStatus('error')
      setMessage('Transacción cancelada por el usuario')
    } else if (!token_ws && !tbk_token) {
      setStatus('error')
      setMessage('Error en la transacción')
    }
  }, [searchParams])

  const confirmTransaction = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/confirm-transaction/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_ws: token }),
      })

      const data = await response.json()
      console.log('Respuesta del servidor:', data)

      // Verificar si hay un error en la respuesta
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago')
      }

      // Verificar el estado de la transacción
      if (data && (data.status === 'AUTHORIZED' || data.vci === 'TSY')) {
        setStatus('success')
        setMessage('Pago realizado con éxito')
        setDetails({
          amount: data.amount,
          orderId: data.buy_order,
          cardNumber: data.card_detail?.card_number,
          products: data.products || []
        })
      } else {
        setStatus('error')
        setMessage(data.error || 'La transacción no fue autorizada')
      }
    } catch (error) {
      console.error('Error al confirmar la transacción:', error)
      setStatus('error')
      setMessage(error.message || 'Error al procesar el pago')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full"
      >
        <div className="text-center">
          {status === 'loading' ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-orange-500 animate-spin" />
              <h2 className="mt-4 text-xl font-semibold">Procesando pago...</h2>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-xl font-semibold text-green-700">¡Pago Exitoso!</h2>
              {details && (
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-semibold">Monto total: ${details.amount}</p>
                  <p>Orden: {details.orderId}</p>
                  {details.cardNumber && (
                    <p>Tarjeta: ****{details.cardNumber}</p>
                  )}
                  {details.products && details.products.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Productos comprados:</h3>
                      <div className="space-y-4">
                        {details.products.map((product) => (
                          <div key={product.id} className="flex items-center border-b pb-2">
                            <div className="w-16 h-16 relative mr-4">
                              <Image
                                src={product.imagen || '/placeholder.png'}
                                alt={product.nombre}
                                fill
                                className="rounded-md object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <p className="font-semibold">{product.nombre}</p>
                              <p className="text-sm text-gray-500">
                                Precio: ${product.precio_venta} x {product.cantidad}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ${(product.precio_venta * product.cantidad).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-xl font-semibold text-red-700">Error en el Pago</h2>
            </>
          )}
          
          <p className="mt-2 text-gray-600">{message}</p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Volver a la tienda
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

