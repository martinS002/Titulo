import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { token_ws } = body

    if (!token_ws) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/api/confirm-transaction/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token_ws }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al confirmar la transacción')
    }

    const data = await response.json()
    
    // Validate the response data
    if (!data || typeof data !== 'object') {
      throw new Error('Respuesta inválida del servidor')
    }

    // After confirming the transaction, call actualizar-pedido
    const actualizarPedidoResponse = await fetch(`${backendUrl}/api/actualizar-pedido/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionDetails: {
          buy_order: data.buy_order,
          amount: data.amount,
          status: data.status,
          transaction_id: data.transaction_id || data.buy_order, // Use buy_order as fallback
        },
        shippingOrder: localStorage.getItem('shippingOrderNumber'),
        shippingReference: localStorage.getItem('shippingReference'),
        cartData: JSON.parse(localStorage.getItem('cartData') || '[]'),
      }),
    })

    if (!actualizarPedidoResponse.ok) {
      const errorData = await actualizarPedidoResponse.json()
      throw new Error(errorData.error || 'Error al actualizar el pedido')
    }

    const actualizarPedidoData = await actualizarPedidoResponse.json()

    // Clear localStorage
    localStorage.removeItem('shippingOrderNumber')
    localStorage.removeItem('shippingReference')
    localStorage.removeItem('cartData')

    return NextResponse.json({ ...data, pedidoActualizado: actualizarPedidoData })
  } catch (error) {
    console.error('Error en el servidor:', error)
    return NextResponse.json(
      { error: 'Error al procesar la transacción' },
      { status: 500 }
    )
  }
}

