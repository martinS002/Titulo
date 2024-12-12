import React, { useState, useEffect } from 'react'
import { getRegions, getComunas, getShippingQuote,createTransportOrder} from '../libs/chilexpress-service'
import ShippingForm from './ShippingForm'

export default function Carrito({ isOpen, setIsOpen, cart, updateQuantity, removeFromCart }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [regions, setRegions] = useState([])
  const [comunas, setComunas] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedComuna, setSelectedComuna] = useState('')
  const [shippingCost, setShippingCost] = useState(0)
  const [showShippingForm, setShowShippingForm] = useState(false)
  

  useEffect(() => {
    if (isOpen) {
      console.log('Cargando regiones...')
      loadRegions()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedRegion) {
      loadComunas(selectedRegion)
    } else {
      setComunas([])
      setSelectedComuna('')
    }
  }, [selectedRegion])

  useEffect(() => {
    if (selectedComuna && cart.length > 0) {
      calculateShipping()
    } else {
      setShippingCost(0)
      setError('')
    }
  }, [selectedComuna, cart])

  const loadRegions = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getRegions()
      console.log('Regiones cargadas:', data)
      setRegions(data.regions || [])
    } catch (error) {
      console.error('Error al cargar las regiones:', error)
      setError('Error al cargar las regiones')
      setRegions([])
    } finally {
      setLoading(false)
    }
  }

  const loadComunas = async (regionId) => {
    try {
      setLoading(true)
      setError('')
      const data = await getComunas(regionId)
      console.log('Comunas cargadas:', data)
      if (data.coverageAreas && data.coverageAreas.length > 0) {
        const principalComunas = data.coverageAreas.filter(comuna => comuna.queryMode === 1)
        setComunas(principalComunas)
        if (principalComunas.length > 0) {
          setSelectedComuna(principalComunas[0].countyCode)
          console.log('Comuna principal seleccionada:', principalComunas[0])
        }
      } else {
        setComunas([])
      }
    } catch (error) {
      console.error('Error al cargar las comunas:', error)
      setError('Error al cargar las comunas')
      setComunas([])
    } finally {
      setLoading(false)
    }
  }

  const calculateShipping = async () => {
    try {
      setLoading(true)
      setError('')
      const totalWeight = cart.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0)
    
      console.log('Calculando envío con parámetros:', {
        origin: 'TILT',
        destination: selectedComuna,
        weight: totalWeight,
        dimensions: {
          height: 10,
          width: 10,
          length: 10
        }
      })

      const quote = await getShippingQuote(
        'TILT',
        selectedComuna,
        {
          weight: totalWeight,
          height: 10,
          width: 10,
          length: 10
        }
      )

      console.log('Respuesta completa de Chilexpress:', quote)

      if (quote?.data?.courierServiceOptions && 
          Array.isArray(quote.data.courierServiceOptions) && 
          quote.data.courierServiceOptions.length > 0) {
        const serviceValue = quote.data.courierServiceOptions[0].serviceValue
        console.log('Costo de envío encontrado:', serviceValue)
        setShippingCost(serviceValue)
        setError('')
      } else {
        console.log('No se encontraron servicios disponibles:', quote)
        setShippingCost(0)
        setError('No hay servicios de envío disponibles para esta ubicación')
      }
    } catch (error) {
      console.error('Error detallado al calcular el envío:', error)
      setError('Error al calcular el costo de envío. Por favor, intente con otra comuna.')
      setShippingCost(0)
    } finally {
      setLoading(false)
    }
  }

  const totalProductsPrice = cart.reduce((sum, item) => {
    const itemPrice = parseFloat(item.precio_venta) || 0
    return sum + (itemPrice * item.quantity)
  }, 0)

  const shippingCostNum = parseFloat(shippingCost.toString()) || 0
  const finalTotal = totalProductsPrice + shippingCostNum

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handlePaymentClick = async () => {
    setShowShippingForm(true)
  }

  const handleShippingSubmit = async (shippingData) => {
    try {
      setLoading(true);
      setError('');
  
      console.log('Enviando datos de envío:', shippingData);
      
      const shippingResult = await createTransportOrder(shippingData);
      
      console.log('Orden de envío generada:', shippingResult);
  
      // Proceed with payment
      const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/init-transaction/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(finalTotal),
          shipping_cost: shippingCostNum,
          shipping_order: shippingResult.orderNumber,
          shipping_reference: shippingResult.reference,
          session_id: `session_${Date.now()}`,
          buy_order: `order_${Date.now()}`,
          cart_items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
          }))
        }),
      });
  
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Error al iniciar la transacción');
      }
  
      const paymentData = await paymentResponse.json();
  
      if (paymentData.url && paymentData.token) {
        // Store shipping data and cart info in localStorage before redirecting
        localStorage.setItem('pendingCartData', JSON.stringify({
          cart: cart,
          totalAmount: finalTotal,
          shippingCost: shippingCostNum
        }));
        localStorage.setItem('pendingShippingData', JSON.stringify(shippingData));
        submitToWebpay(paymentData.url, paymentData.token);
      } else {
        throw new Error('La respuesta del servidor de pagos no contiene los datos necesarios');
      }
    } catch (error) {
      console.error('Error detallado en el proceso:', error);
      setError(`Error en el proceso: ${error.message}`);
    } finally {
      setLoading(false);
      setShowShippingForm(false);
    }
  };

  const submitToWebpay = (url, token) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = url

    const tokenInput = document.createElement('input')
    tokenInput.type = 'hidden'
    tokenInput.name = 'token_ws'
    tokenInput.value = token

    form.appendChild(tokenInput)
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="w-full max-w-md h-full overflow-y-auto bg-white p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Carrito de Compras</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            X
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-center text-gray-600">Tu carrito está vacío</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="flex items-center mb-4 bg-gray-50 p-4 rounded-lg">
                <img
                  src={item.imagen}
                  alt={item.nombre || 'Producto'}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.nombre}</h3>
                  <p className="text-gray-600">{formatPrice(parseFloat(item.precio_venta))} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="bg-gray-200 p-1 rounded-full"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 p-1 rounded-full"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                  Región
                </label>
                <select
                  id="region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  disabled={loading}
                >
                  <option value="">Seleccione región</option>
                  {Array.isArray(regions) && regions.map((region) => (
                    <option key={region.regionId} value={region.regionId}>
                      {region.regionName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="comuna" className="block text-sm font-medium text-gray-700">
                  Comuna
                </label>
                <select
                  id="comuna"
                  value={selectedComuna}
                  onChange={(e) => {
                    const selected = comunas.find(c => c.countyCode === e.target.value);
                    if (selected) {
                      console.log('Comuna seleccionada:', selected);
                      setSelectedComuna(selected.countyCode);
                    }
                  }}
                  disabled={!selectedRegion || loading}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleccione comuna</option>
                  {Array.isArray(comunas) &&
                    comunas.map((comuna) => (
                      <option key={comuna.countyCode} value={comuna.countyCode}>
                        {comuna.countyName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Total productos:</span>
                  <span>{formatPrice(totalProductsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de envío:</span>
                  <span>{formatPrice(shippingCostNum)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {error && (
                <p className="text-red-500 mt-2">{error}</p>
              )}

              <button
                onClick={handlePaymentClick}
                disabled={loading || cart.length === 0 || !selectedComuna || shippingCost === 0}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded mt-4 font-semibold disabled:opacity-50 hover:bg-blue-600"
              >
                {loading ? 'Procesando...' : 'Proceder al pago'}
              </button>
            </div>
          </>
        )}
        {showShippingForm && (
          <ShippingForm
            onSubmit={handleShippingSubmit}
            onCancel={() => setShowShippingForm(false)}
            totalAmount={finalTotal}
            shippingCost={shippingCostNum}
            selectedComuna={selectedComuna}
          />
        )}
      </div>
    </div>
  )
}

