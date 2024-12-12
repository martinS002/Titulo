import { ProveedorCard } from './proveedor-card'

async function getProveedores() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proveedor/`, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching proveedores:', error)
    throw error
  }
}

export async function ProveedorList() {
  const proveedores = await getProveedores()

  if (!proveedores || proveedores.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No hay proveedores disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {proveedores.map((proveedor) => (
        <ProveedorCard key={proveedor.id} proveedor={proveedor} />
      ))}
    </div>
  )
}

