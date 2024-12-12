export function filterProductData(product) {
    return {
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio_venta: product.precio_venta,
      imagen: product.imagen,
      quantity: product.quantity || 1
    }
  }
  
  export function saveCartToStorage(cart) {
    try {
      localStorage.setItem('cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }
  
  export function loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem('cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Error loading cart:', error)
      return []
    }
  }