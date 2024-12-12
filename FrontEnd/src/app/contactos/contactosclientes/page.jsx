'use client'

import { useEffect, useState } from 'react'

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contact/`)
        if (!response.ok) {
          throw new Error('Failed to fetch contacts')
        }
        const data = await response.json()
        setContacts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF6B00]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-[#FF6B00] px-6 py-4">
          <h2 className="text-white text-2xl font-bold">Lista de Contactos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FF6B00] uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FF6B00] uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FF6B00] uppercase tracking-wider">Mensaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FF6B00] uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{contact.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{contact.email}</td>
                  <td className="px-6 py-4 max-w-md truncate">{contact.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.fecha 
                      ? new Date(contact.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Fecha no disponible'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

