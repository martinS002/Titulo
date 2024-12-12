import React from 'react'

const StockLimitModal = ({ isOpen, onClose, productName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Límite de Stock Alcanzado</h3>
        <p>Has alcanzado el límite de stock disponible para {productName}.</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default StockLimitModal

