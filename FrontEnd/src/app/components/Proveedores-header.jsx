'use client'

import { useState } from 'react'
import { AgregarProveedor } from './agregar-proveedor'

export function ProveedoresHeader() {
  const [showAgregar, setShowAgregar] = useState(false)

  return (
    <>
      <header className="bg-white text-black py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Proveedores</h1>
            <button
              onClick={() => setShowAgregar(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Agregar Proveedor
            </button>
          </div>
          <p className="mt-2">Gestiona tus proveedores y envíos</p>
        </div>
      </header>
      {showAgregar && <AgregarProveedor onClose={() => setShowAgregar(false)} />}
    </>
  )
}

