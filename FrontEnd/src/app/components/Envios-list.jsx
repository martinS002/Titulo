'use client'

import { useState, useEffect } from 'react'
import { AgregarEnvio } from './Agregar-envio'

export function EnviosList({ proveedorId }) {
  const [envios, setEnvios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAgregarEnvio, setShowAgregarEnvio] = useState(false)

  const fetchEnvios = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/envios/?proveedor=${proveedorId}`)
      if (res.ok) {
        const data = await res.json()
        setEnvios(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEnvios()
  }, [proveedorId])

  const actualizarEstado = async (envioId, nuevoEstado) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/envios/${envioId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (res.ok) {
        fetchEnvios()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el estado del envío')
    }
  }

  if (loading) return <p className="mt-4">Cargando envíos...</p>

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Envíos</h3>
        <button
          onClick={() => setShowAgregarEnvio(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Nuevo Envío
        </button>
      </div>
      
      {envios.length === 0 ? (
        <p>No hay envíos registrados para este proveedor.</p>
      ) : (
        <div className="space-y-4">
          {envios.map((envio) => (
            <div key={envio.id} className="bg-white shadow rounded-lg p-4 border-l-4 border-orange-500">
              <p className="mb-2"><strong>Fecha:</strong> {new Date(envio.fecha).toLocaleDateString('es-ES')}</p>
              {envio.descripcion && (
                <p className="mb-2"><strong>Descripción:</strong> {envio.descripcion}</p>
              )}
              <p className="mb-4">
                <strong>Estado:</strong>{' '}
                <span className={`px-2 py-1 rounded ${
                  envio.estado === 'Recibido' ? 'bg-green-100 text-green-800' :
                  envio.estado === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {envio.estado}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => actualizarEstado(envio.id, 'En Proceso')}
                  className={`px-3 py-1 rounded ${
                    envio.estado === 'En Proceso'
                      ? 'bg-gray-300'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                  disabled={envio.estado === 'En Proceso'}
                >
                  En Proceso
                </button>
                <button
                  onClick={() => actualizarEstado(envio.id, 'Enviado')}
                  className={`px-3 py-1 rounded ${
                    envio.estado === 'Enviado'
                      ? 'bg-gray-300'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={envio.estado === 'Enviado'}
                >
                  Enviado
                </button>
                <button
                  onClick={() => actualizarEstado(envio.id, 'Recibido')}
                  className={`px-3 py-1 rounded ${
                    envio.estado === 'Recibido'
                      ? 'bg-gray-300'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  disabled={envio.estado === 'Recibido'}
                >
                  Recibido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showAgregarEnvio && (
        <AgregarEnvio
          proveedorId={proveedorId}
          onClose={() => setShowAgregarEnvio(false)}
          onEnvioCreado={fetchEnvios}
        />
      )}
    </div>
  )
}

