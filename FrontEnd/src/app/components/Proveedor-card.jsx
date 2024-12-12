'use client'

import { useState } from 'react'
import { EditarProveedor } from './editar-proveedor'
import { ContactoButton } from './contacto-button'
import { EnviosList } from './envios-list'

export function ProveedorCard({ proveedor }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showEnvios, setShowEnvios] = useState(false)

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proveedor/${proveedor.id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          window.location.reload()
        } else {
          alert('Error al eliminar el proveedor')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error al eliminar el proveedor')
      }
    }
  }

  // Formatear la fecha usando es-ES locale
  const fechaFormateada = new Date(proveedor.fecha_registro).toLocaleDateString('es-ES')

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border-l-4 border-orange-500">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">{proveedor.nombre_proveedores}</h2>
        <div className="space-y-2 mb-4">
          <p><strong>Producto:</strong> {proveedor.producto_suministrado}</p>
          <p><strong>Método de pago:</strong> {proveedor.metodo_de_pago}</p>
          <p><strong>Fecha de registro:</strong> {fechaFormateada}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ContactoButton 
            telefono={proveedor.telefono} 
            email={proveedor.correo_electronico}
          />
          <button
            onClick={() => setShowEnvios(!showEnvios)}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            {showEnvios ? 'Ocultar Envíos' : 'Mostrar Envíos'}
          </button>
        </div>
        {showEnvios && <EnviosList proveedorId={proveedor.id} />}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
      {isEditing && (
        <EditarProveedor 
          proveedor={proveedor} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </div>
  )
}

