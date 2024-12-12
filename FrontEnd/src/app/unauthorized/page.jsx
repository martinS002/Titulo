export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Acceso No Autorizado</h1>
        <p className="text-xl text-gray-700 mb-6">
          Lo siento, no tienes permiso para acceder a esta página.
        
        </p>
      </div>
    </div>
  )
}