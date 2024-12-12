'use client'

import { useState } from 'react'

export function ContactoButton({ telefono, email }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
      >
        Contacto
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Información de Contacto</h2>
            <p className="mb-2"><strong>Teléfono:</strong> {telefono}</p>
            <p className="mb-4"><strong>Email:</strong> {email}</p>
            <button 
              onClick={() => setIsOpen(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

