"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function FormTask() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/`, {
      method: "POST",
      body: JSON.stringify({ title, description }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    const data = await res.json()
    router.refresh()
    setTitle("")
    setDescription("")
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Añadir Tarea</h2>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors duration-300"
        >
          Guardar
        </button>
      </form>
    </div>
  )
}

export default FormTask