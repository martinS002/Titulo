'use client'

import { useState, useEffect } from 'react'
import { Bell, TruckIcon } from 'lucide-react'
import Link from 'next/link'

export default function NotificacionesStock() {
    const [notificaciones, setNotificaciones] = useState([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        fetchNotificaciones()
    }, [])

    const fetchNotificaciones = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notificaciones/`)
            if (!response.ok) {
                throw new Error('Error al obtener notificaciones')
            }
            const data = await response.json()
            setNotificaciones(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const marcarComoLeida = async (id) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notificaciones/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ leida: true }),
            })
            if (!response.ok) {
                throw new Error('Error al marcar como leída')
            }
            setNotificaciones(notificaciones.map(n => n.id === id ? { ...n, leida: true } : n))
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const notificacionesNoLeidas = notificaciones.filter(n => !n.leida)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white hover:text-yellow-300 transition duration-300"
            >
                <Bell className="h-6 w-6" />
                {notificacionesNoLeidas.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notificacionesNoLeidas.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold">Notificaciones de Stock</h3>
                    </div>
                    {notificaciones.length > 0 ? (
                        notificaciones.map((notificacion) => (
                            <div
                                key={notificacion.id}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${!notificacion.leida ? 'bg-orange-50' : ''}`}
                                onClick={() => marcarComoLeida(notificacion.id)}
                            >
                                <p className="text-sm">{notificacion.mensaje}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notificacion.fecha_creacion).toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No hay notificaciones
                        </div>
                    )}
                    <div className="p-4 border-t">
                        <Link href="/proveedores" className="w-full">
                            <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center">
                                <TruckIcon className="mr-2 h-4 w-4" />
                                Ir a Proveedores
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

