'use client'

import { useState } from 'react'

export function AgregarProveedor({ onClose }) {
  const [formData, setFormData] = useState({
    nombre_proveedores: '',
    producto_suministrado: '',
    telefono: '',
    correo_electronico: '',
    metodo_de_pago: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proveedor/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        onClose()
        window.location.reload()
      } else {
        const error = await res.json()
        alert(error.message || 'Error al crear el proveedor')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el proveedor')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Proveedor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500"
              value={formData.nombre_proveedores}
              onChange={(e) => setFormData({ ...formData, nombre_proveedores: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Producto</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500"
              value={formData.producto_suministrado}
              onChange={(e) => setFormData({ ...formData, producto_suministrado: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500"
              value={formData.correo_electronico}
              onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Método de Pago</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500"
              value={formData.metodo_de_pago}
              onChange={(e) => setFormData({ ...formData, metodo_de_pago: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

