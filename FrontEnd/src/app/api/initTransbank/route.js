import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { totalAmount, sessionId, buyOrder } = body

    if (!totalAmount || !sessionId || !buyOrder) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/api/init-transaction/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: totalAmount,
        session_id: sessionId,
        buy_order: buyOrder,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al iniciar la transacción')
    }

    const data = await response.json()

    if (!data.url || !data.token) {
      throw new Error('Respuesta inválida del servidor')
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en el servidor:', error)
    return NextResponse.json(
      { error: 'Error al procesar la transacción' },
      { status: 500 }
    )
  }
}

