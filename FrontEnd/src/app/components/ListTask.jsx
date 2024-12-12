import TaskCard from "./TaskCard"

export const dynamic = "force-dynamic"

async function loadTasks() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/`)
  const tasks = await response.json()
  return tasks
}

async function ListTask() {
  const tasks = await loadTasks()

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lista de tareas</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-600">No hay tareas pendientes.</p>
      ) : (
        tasks.map(task => (
          <TaskCard task={task} key={task.id} />
        ))
      )}
    </div>
  )
}

export default ListTask