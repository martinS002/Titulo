import { useEffect } from 'react';

export default function StockUpdater({ ventaDetalles, onStockUpdated }) {
  useEffect(() => {
    if (ventaDetalles) {
      updateStockForSale(ventaDetalles);
    }
  }, [ventaDetalles, onStockUpdated]);

  const updateStockForSale = async (venta) => {
    for (const detalle of venta.detalles) {
      await updateStockInDatabase(detalle.producto, detalle.producto_stock);
    }
    onStockUpdated();
  };

  const updateStockInDatabase = async (productoId, newStock) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventario/${productoId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al actualizar el stock: ${errorData.error || res.statusText}`);
      }

      console.log(`Stock actualizado para el producto ${productoId}`);
    } catch (error) {
      console.error('Error al actualizar el stock:', error);
    }
  };

  return null;
}

