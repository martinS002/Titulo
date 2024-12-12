import React from 'react';

export default function Nosotros() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Nosotros</h1>
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:gap-8">
          <div className="flex-shrink-0 mb-6 lg:mb-0">
            <img 
              src="/Logo.png"
              alt="Nuestra empresa" 
              className="w-32 h-32 lg:w-40 lg:h-40 object-contain"
            />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">¿Quiénes somos?</h2>
            <p className="text-gray-600 mb-4">
              Somos StockLiteEasy, una empresa dedicada a ofrecer soluciones de sistemas de inventario para negocios de todos los tamaños. Nuestro objetivo es ayudar a las empresas a gestionar sus inventarios de manera eficiente y efectiva, permitiéndoles centrarse en lo que mejor saben hacer: hacer crecer su negocio.
            </p>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Nuestra misión</h2>
            <p className="text-gray-600 mb-4">
              Nuestra misión es proporcionar herramientas de gestión de inventario que sean fáciles de usar, accesibles y adaptables a las necesidades específicas de cada cliente. Creemos que una buena gestión del inventario es clave para el éxito de cualquier negocio, y estamos comprometidos a ofrecer soluciones que hagan esta tarea lo más sencilla posible.
            </p>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Nuestros valores</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Innovación: Siempre estamos buscando nuevas formas de mejorar y ofrecer las mejores soluciones a nuestros clientes.</li>
              <li>Calidad: Nos esforzamos por ofrecer productos y servicios de la más alta calidad.</li>
              <li>Compromiso: Estamos comprometidos con el éxito de nuestros clientes y trabajamos arduamente para asegurarnos de que estén satisfechos con nuestras soluciones.</li>
              <li>Integridad: Operamos con honestidad y transparencia en todas nuestras interacciones.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
