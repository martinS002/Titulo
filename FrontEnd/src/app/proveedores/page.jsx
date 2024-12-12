import { Suspense } from 'react'
import { ProveedorList } from '../components/proveedor-list'
import { ProveedoresHeader } from '../components/Proveedores-header'

export default function ProveedoresPage() {
  return (
    <div className="min-h-screen ">
      <ProveedoresHeader />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="text-center p-4">
            Cargando proveedores...
          </div>
        }>
          <ProveedorList />
        </Suspense>
      </main>
    </div>
  )
}

