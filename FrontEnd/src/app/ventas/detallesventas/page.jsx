'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Calendar, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('es', es);

export default function VentasList() {
  const [ventas, setVentas] = useState([]);
  const [expandedVenta, setExpandedVenta] = useState(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    fecha: null,
    metodoPago: '',
    facturacion: '',
    precioMin: '',
    precioMax: '',
    productoMasVendido: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    fetchVentas();
    fetchCategorias();
  }, [filtros.fecha]); 

  useEffect(() => {
    fetchProductosMasVendidos();
  }, [filtros.fecha]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtros]);

  const fetchVentas = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ventas/`;
      const params = new URLSearchParams();
      
      if (filtros.fecha) {
        params.append('fecha', new Date(filtros.fecha).toISOString().split('T')[0]);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setVentas(data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    }
  };

  const fetchProductosMasVendidos = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/productos-mas-vendidos/`;
      const params = new URLSearchParams();
      
      if (filtros.fecha) {
        params.append('fecha', new Date(filtros.fecha).toISOString().split('T')[0]);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setProductosMasVendidos(data);
    } catch (error) {
      console.error('Error al cargar productos más vendidos:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categorias-productos/`;
      if (filtros.fecha) {
        url += `?fecha=${new Date(filtros.fecha).toISOString().split('T')[0]}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.svg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${imagePath}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const toggleVentaExpansion = (ventaId) => {
    setExpandedVenta(expandedVenta === ventaId ? null : ventaId);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const resetFiltros = () => {
    setFiltros({
      busqueda: '',
      fecha: null,
      metodoPago: '',
      facturacion: '',
      precioMin: '',
      precioMax: '',
      productoMasVendido: ''
    });
  };

  const filtrarVentas = () => {
    return ventas.filter((venta) => {
      if (filtros.busqueda) {
        const searchTerm = filtros.busqueda.toLowerCase();
        const matchesId = venta.id.toString().includes(searchTerm);
        const matchesPayment = venta.metodo_de_pago.toLowerCase().includes(searchTerm);
        if (!matchesId && !matchesPayment) {
          return false;
        }
      }

      if (filtros.fecha) {
        const fechaVenta = new Date(venta.fecha_venta);
        const fechaFiltro = new Date(filtros.fecha);
        if (
          fechaVenta.getFullYear() !== fechaFiltro.getFullYear() ||
          fechaVenta.getMonth() !== fechaFiltro.getMonth() ||
          fechaVenta.getDate() !== fechaFiltro.getDate()
        ) {
          return false;
        }
      }

      if (filtros.metodoPago && venta.metodo_de_pago.toLowerCase() !== filtros.metodoPago.toLowerCase()) {
        return false;
      }

      if (filtros.facturacion && venta.facturacion.toLowerCase() !== filtros.facturacion.toLowerCase()) {
        return false;
      }

      const ventaTotal = parseFloat(venta.total);
      if (filtros.precioMin && ventaTotal < parseFloat(filtros.precioMin)) {
        return false;
      }
      if (filtros.precioMax && ventaTotal > parseFloat(filtros.precioMax)) {
        return false;
      }

      if (filtros.productoMasVendido) {
        const tieneProducto = venta.detalles?.some(
          detalle => detalle.producto?.toString() === filtros.productoMasVendido
        );
        if (!tieneProducto) return false;
      }

      return true;
    });
  };

  const ventasFiltradas = filtrarVentas();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ventasFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Lista de Ventas</h1>
          <Link 
            href="/ventas" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Ir a ventas
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Panel de Filtros */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 sticky top-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
                <button
                  onClick={resetFiltros}
                  className="text-orange-500 hover:text-orange-600 transition-colors duration-200"
                  title="Reiniciar filtros"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <div className="relative">
                  <DatePicker
                    selected={filtros.fecha}
                    onChange={(date) => handleFiltroChange('fecha', date)}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    className="w-full border border-gray-300 rounded-lg p-2 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholderText="Seleccionar fecha"
                  />
                  {filtros.fecha && (
                    <button
                      onClick={() => handleFiltroChange('fecha', null)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={filtros.metodoPago}
                  onChange={(e) => handleFiltroChange('metodoPago', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              {/* Facturación */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Facturación</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={filtros.facturacion}
                  onChange={(e) => handleFiltroChange('facturacion', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="boleta">Boleta</option>
                  <option value="factura">Factura</option>
                </select>
              </div>

              {/* Rango de Precio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Rango de Precio</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={filtros.precioMin}
                    onChange={(e) => handleFiltroChange('precioMin', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={filtros.precioMax}
                    onChange={(e) => handleFiltroChange('precioMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Producto más vendido */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Producto más vendido</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={filtros.productoMasVendido}
                  onChange={(e) => handleFiltroChange('productoMasVendido', e.target.value)}
                >
                  <option value="">Todos los productos</option>
                  {productosMasVendidos.map((producto) => (
                    <option key={producto.producto__id} value={producto.producto__id}>
                      {`${producto.producto__nombre} (${producto.total_vendido} vendidos)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Ventas */}
          <div className="flex-1">
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Buscar por ID o método de pago..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="grid gap-4">
              {currentItems.map((venta) => (
                <div
                  key={venta.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleVentaExpansion(venta.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Venta #{venta.id}</h3>
                        <p className="text-sm text-gray-500">{formatDate(venta.fecha_venta)}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                        ${venta.total.toLocaleString()}
                      </span>
                    </div>

                    {expandedVenta === venta.id && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Método de Pago:</p>
                            <p className="font-medium">{venta.metodo_de_pago}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Facturación:</p>
                            <p className="font-medium">{venta.facturacion}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Productos:</h4>
                          <div className="grid gap-3">
                            {venta.detalles.map((detalle, index) => (
                              <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                <div className="relative w-16 h-16 flex-shrink-0">
                                  <Image
                                    src={getImageUrl(detalle.imagen_producto)}
                                    alt={`Producto ${detalle.producto_nombre || 'sin nombre'}`}
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 truncate">
                                    {detalle.producto_nombre}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {detalle.cantidad} × ${detalle.precio_unitario.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {detalle.producto_categoria}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-800">
                                    ${(detalle.cantidad * detalle.precio_unitario).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {currentItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron ventas con los filtros seleccionados</p>
                </div>
              )}
            </div>

            {ventasFiltradas.length > 0 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}