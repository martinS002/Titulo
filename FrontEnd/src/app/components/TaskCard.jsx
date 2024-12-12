"use client"

import { useState } from 'react'
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Check, X } from "lucide-react"

function TaskCard({ task }) {
  const router = useRouter()
  const [edit, setEdit] = useState(false)
  const [newTitle, setNewTitle] = useState(task.title)
  const [newDescription, setNewDescription] = useState(task.description)

  const handleDelete = async (id) => {
    if (window.confirm("¿Quieres eliminar esta tarea?")) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${id}/`, {
        method: "DELETE",
      })
      if (res.status === 204) {
        router.refresh()
      }
    }
  }

  const handleTaskDone = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${id}/done/`, {
      method: "POST",
    })
    if (res.status === 200) {
      router.refresh()
    }
  }

  const handleUpdate = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${id}/`, {
      method: "PUT",
      body: JSON.stringify({ title: newTitle, description: newDescription }),
      headers: { "Content-Type": "application/json" }
    })
    const data = await res.json()
    setNewTitle(data.title)
    setNewDescription(data.description)
    setEdit(false)
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {!edit ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {newTitle}
                {task.done && <span className="ml-2 text-green-500">✓</span>}
              </h2>
              <p className="text-gray-600">{newDescription}</p>
            </>
          ) : (
            <>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                rows={3}
              />
            </>
          )}
        </div>
        <div className="flex space-x-2 ml-4">
          {edit ? (
            <button
              onClick={() => handleUpdate(task.id)}
              className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-300"
            >
              <Check size={16} />
            </button>
          ) : (
            <button
              onClick={() => setEdit(true)}
              className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-300"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            onClick={() => handleTaskDone(task.id)}
            className={`p-2 rounded-full transition-colors duration-300 ${
              task.done
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-300 hover:bg-gray-400"
            } text-white`}
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskCard