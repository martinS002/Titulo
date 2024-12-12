export default function Filtro({
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    categories,
  }) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 ">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 sm:mb-0 p-2 border rounded-md w-full sm:w-64 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          aria-label="Buscar productos"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded-md w-full sm:w-auto dark:bg-gray-700 text-gray-800 dark:text-gray-200 "
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    )
  }