'use client'

import { useState } from 'react'

export function AgregarEnvio({ proveedorId, onClose, onEnvioCreado }) {
  const [formData, setFormData] = useState({
    proveedor: proveedorId,
    estado: 'En Proceso',
    descripcion: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/envios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        onEnvioCreado()
        onClose()
      } else {
        alert('Error al crear el envío')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el envío')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Nuevo Envío</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            >
              <option value="En Proceso">En Proceso</option>
              <option value="Enviado">Enviado</option>
              <option value="Recibido">Recibido</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Crear Envío
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

