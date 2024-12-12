'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter(); // Inicializa el router

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();

      if (data) {
        setMessage('Gracias por contactarnos. Te responderemos pronto.');

        // Validación para resetear el formulario
        if (event.currentTarget && typeof event.currentTarget.reset === 'function') {
          event.currentTarget.reset();
        }

        // Redirigir a la página principal después de un breve delay
        setTimeout(() => router.push('/'), 3000);
      } else {
        throw new Error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Hubo un error al enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-extrabold  text-center mb-6">Contáctanos</h1>
        <p className="text-gray-700 text-center mb-6">
          ¿Tienes preguntas, comentarios o necesitas ayuda? ¡Estamos aquí para ti! Completa el formulario y te responderemos lo antes posible.
        </p>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-orange-300"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-orange-300"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-700">
              Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-orange-300 min-h-[120px]"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            message.includes('error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
