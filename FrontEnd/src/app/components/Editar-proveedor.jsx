'use client'

import { useState } from 'react'

export function EditarProveedor({ proveedor, onClose }) {
  const [formData, setFormData] = useState(proveedor)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proveedor/${proveedor.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    if (res.ok) {
      onClose()
      window.location.reload()
    } else {
      alert('Error al actualizar el proveedor')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Editar Proveedor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.nombre_proveedores}
            onChange={(e) => setFormData({ ...formData, nombre_proveedores: e.target.value })}
            placeholder="Nombre del proveedor"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.producto_suministrado}
            onChange={(e) => setFormData({ ...formData, producto_suministrado: e.target.value })}
            placeholder="Producto suministrado"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="Teléfono"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.correo_electronico}
            onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
            placeholder="Correo electrónico"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded"
            value={formData.metodo_de_pago}
            onChange={(e) => setFormData({ ...formData, metodo_de_pago: e.target.value })}
            placeholder="Método de pago"
          />
          <div className="flex justify-end space-x-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">Guardar cambios</button>
            <button type="button" onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition duration-300">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

