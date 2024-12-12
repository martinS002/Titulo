'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Filtro from '../components/Filtro';
import Link from 'next/link';

export default function Ventas() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [codigoProducto, setCodigoProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('');
  const [facturacion, setFacturacion] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [ventaRegistrada, setVentaRegistrada] = useState(false);
  const [ventaDetalles, setVentaDetalles] = useState(null);
  const inputRef = useRef(null);

  // Nuevo estado para el modal de alerta de stock
  const [stockAlertModalOpen, setStockAlertModalOpen] = useState(false);
  const [stockAlertProduct, setStockAlertProduct] = useState(null);

  // Estados para búsqueda y filtrado
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProductos();
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const nuevoTotal = productosSeleccionados.reduce(
      (acc, producto) => acc + producto.precio_venta * producto.cantidad,
      0
    );
    setTotal(nuevoTotal);
  }, [productosSeleccionados]);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/`);
      const data = await res.json();
      setProductos(data);

      // Obtener categorías únicas de los productos
      const uniqueCategories = [...new Set(data.map(producto => producto.categoria))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleCodigoChange = (e) => {
    const codigo = e.target.value;
    setCodigoProducto(codigo);
    const producto = productos.find((p) => p.codigo_producto === codigo);
    if (producto) {
      agregarProducto(producto);
      setCodigoProducto('');
    }
  };

  const showStockAlert = (producto) => {
    setStockAlertProduct(producto);
    setStockAlertModalOpen(true);
  };

  const agregarProducto = (producto) => {
    const productoExistente = productosSeleccionados.find(
      (p) => p.codigo_producto === producto.codigo_producto
    );
    if (productoExistente) {
      if (productoExistente.cantidad + 1 > producto.stock) {
        showStockAlert(producto);
        return;
      }
      const nuevosProductosSeleccionados = productosSeleccionados.map((p) =>
        p.codigo_producto === producto.codigo_producto
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      );
      setProductosSeleccionados(nuevosProductosSeleccionados);
    } else {
      if (producto.stock < 1) {
        showStockAlert(producto);
        return;
      }
      const productoConCantidad = { ...producto, cantidad: 1 };
      setProductosSeleccionados([...productosSeleccionados, productoConCantidad]);
    }
  };

  const eliminarProducto = (codigo) => {
    const nuevosProductosSeleccionados = productosSeleccionados.filter(
      (p) => p.codigo_producto !== codigo
    );
    setProductosSeleccionados(nuevosProductosSeleccionados);
  };

  const aumentarCantidad = (codigo) => {
    const producto = productos.find((p) => p.codigo_producto === codigo);
    const productoSeleccionado = productosSeleccionados.find(
      (p) => p.codigo_producto === codigo
    );
    if (productoSeleccionado.cantidad + 1 > producto.stock) {
      showStockAlert(producto);
      return;
    }
    const nuevosProductosSeleccionados = productosSeleccionados.map((p) =>
      p.codigo_producto === codigo
        ? { ...p, cantidad: p.cantidad + 1 }
        : p
    );
    setProductosSeleccionados(nuevosProductosSeleccionados);
  };

  const disminuirCantidad = (codigo) => {
    const nuevosProductosSeleccionados = productosSeleccionados.map((p) =>
      p.codigo_producto === codigo && p.cantidad > 1
        ? { ...p, cantidad: p.cantidad - 1 }
        : p
    );
    setProductosSeleccionados(nuevosProductosSeleccionados);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productosSeleccionados.length === 0) {
      alert('No hay productos seleccionados');
      return;
    }

    if (!metodoPago || metodoPago.length === 0) {
      alert('Debe seleccionar un método de pago');
      return;
    }

    try {
      const venta = {
        metodo_de_pago: metodoPago,
        facturacion: facturacion,
        total: total,
        detalles: productosSeleccionados.map((producto) => ({
          producto: producto.id,
          cantidad: producto.cantidad,
          precio_unitario: producto.precio_venta,
        })),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ventas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venta),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al registrar la venta');
      }

      const ventaRegistrada = await res.json();

      // Actualizar stock tras registrar la venta
      await Promise.all(
        productosSeleccionados.map(async (producto) => {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/${producto.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock: producto.stock - producto.cantidad }),
          });
        })
      );

      setVentaRegistrada(true);
      setVentaDetalles({
        ...ventaRegistrada,
        detalles: ventaRegistrada.detalles.map((detalle) => {
          const producto = productos.find((p) => p.id === detalle.producto);
          return {
            ...detalle,
            imagen: producto ? producto.imagen : '',
            producto_nombre: producto ? producto.nombre : '',
          };
        }),
      });

      resetForm();
      setProductosSeleccionados([]);
      setModalOpen(false);

      // Refrescar los productos para actualizar el stock
      await fetchProductos();
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      alert(error.message);
    }
  };

  const resetForm = () => {
    setCodigoProducto('');
    setProductoSeleccionado(null);
    inputRef.current.focus();
  };

  // Filtrar productos basados en la búsqueda y la categoría
  const productosFiltrados = productos.filter((producto) => {
    return (
      producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (categoryFilter === '' || producto.categoria === categoryFilter)
    );
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4">
        <Link href="ventas/detallesventas" className="bg-orange-500 text-white p-2 rounded-md">
          Ir a detalles de las ventas
        </Link>
      </div>
      {ventaRegistrada && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Venta registrada con éxito</h3>
          {ventaDetalles && (
  <div className="space-y-4">
    <p><strong>Método de Pago:</strong> {ventaDetalles.metodo_de_pago}</p>
    <p><strong>Facturación:</strong> {ventaDetalles.facturacion}</p>
    <p><strong>Total:</strong> ${ventaDetalles.total}</p>
    <h4 className="text-lg font-semibold">Productos:</h4>
    {ventaDetalles.detalles.map((detalle, index) => (
      <div key={index} className="border border-gray-200 rounded-md p-4">
        <Image src={detalle.imagen} alt={detalle.producto_nombre} width={64} height={64} className="object-cover" />
        <p><strong>Nombre:</strong> {detalle.producto_nombre}</p>
        <p><strong>Cantidad:</strong> {detalle.cantidad}</p>
        <p><strong>Precio Unitario:</strong> ${detalle.precio_unitario}</p>
      </div>
    ))}
  </div>
)}

          <button
            onClick={() => setVentaRegistrada(false)}
            className="mt-6 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Registrar Venta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="codigoProducto" className="block text-sm font-medium text-gray-700 mb-1">
                Código del Producto
              </label>
              <input
                id="codigoProducto"
                type="text"
                value={codigoProducto}
                onChange={handleCodigoChange}
                ref={inputRef}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {productoSeleccionado && (
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="font-semibold">Producto: {productoSeleccionado.nombre}</p>
                <p>Precio: ${productoSeleccionado.precio_venta}</p>
                <p>Stock: {productoSeleccionado.stock}</p>
                <Image src={productoSeleccionado.imagen} alt={productoSeleccionado.nombre} width={128} height={128} className="object-cover mt-2" />
                <button
                  onClick={() => agregarProducto(productoSeleccionado)}
                  className="mt-2 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                  type="button"
                >
                  Agregar Producto
                </button>
              </div>
            )}

            <div>
              <p className="text-lg font-semibold">Total: ${total}</p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
            >
              Proceder Venta
            </button>
          </form>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Productos Seleccionados</h2>
          {productosSeleccionados.map((producto) => (
            <div key={producto.codigo_producto} className="mb-4 p-4 border border-gray-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image src={producto.imagen} alt={producto.nombre} width={64} height={64} className="object-cover mr-4" />
                  <div>
                    <p className="font-semibold">{producto.nombre}</p>
                    <p>Cantidad: {producto.cantidad}</p>
                    <p>Precio: ${producto.precio_venta}</p>
                    <p>Stock: {producto.stock}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => disminuirCantidad(producto.codigo_producto)} className="bg-gray-200 text-gray-700 py-1 px-2 rounded-md hover:bg-gray-300 transition-colors">-</button>
                  <button onClick={() => aumentarCantidad(producto.codigo_producto)} className="bg-gray-200 text-gray-700 py-1 px-2 rounded-md hover:bg-gray-300 transition-colors">+</button>
                  <button onClick={() => eliminarProducto(producto.codigo_producto)} className="bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600 transition-colors">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Productos</h2>
        <Filtro
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => (
            <div key={producto.codigo_producto} className="border border-gray-200 rounded-md p-4">
              <Image src={producto.imagen} alt={producto.nombre} width={200} height={200} className="w-full h-32 object-cover mb-4" />
              <p className="font-semibold">{producto.nombre}</p>
              <p>Precio: ${producto.precio_venta}</p>
              <p>Stock: {producto.stock}</p>
              <button
                onClick={() => agregarProducto(producto)}
                className="mt-2 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmar Venta</h3>
            <div className="space-y-4">
              {productosSeleccionados.map((producto) => (
                <div key={producto.codigo_producto} className="border border-gray-200 rounded-md p-4">
                  <p className="font-semibold">{producto.nombre}</p>
                  <p>Cantidad: {producto.cantidad}</p>
                  <p>Precio: ${producto.precio_venta}</p>
                </div>
              ))}
              <div>
                <label htmlFor="metodoPagoModal" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  id="metodoPagoModal"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Seleccione un método de pago</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div>
                <label htmlFor="facturacionModal" className="block text-sm font-medium text-gray-700 mb-1">
                  Facturación
                </label>
                <select
                  id="facturacionModal"
                  value={facturacion}
                  onChange={(e) => setFacturacion(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Seleccione una opción</option>
                  <option value="boleta">Boleta</option>
                  <option value="factura">Factura</option>
                </select>
              </div>
              <div>
                <p className="text-lg font-semibold">Total: ${total}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
              >
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {stockAlertModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Alerta de Stock</h3>
            {stockAlertProduct && (
              <div className="flex items-center space-x-4">
                <Image src={stockAlertProduct.imagen} alt={stockAlertProduct.nombre} width={64} height={64} className="object-cover" />
                <div>
                  <p className="font-semibold">{stockAlertProduct.nombre}</p>
                  <p>Stock disponible: {stockAlertProduct.stock}</p>
                </div>
              </div>
            )}
            <p className="mt-4">No hay suficiente stock para este producto.</p>
            <button
              onClick={() => setStockAlertModalOpen(false)}
              className="mt-6 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}