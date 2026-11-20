import { createContext, useContext, useEffect, useState } from 'react'

const CarritoContext = createContext()

function leerCarritoGuardado() {
  const guardado = localStorage.getItem('carrito')
  return guardado ? JSON.parse(guardado) : []
}

// el carrito se guarda en localStorage para no perderlo al recargar
export function CarritoProvider({ children }) {
  // cada item es { producto, cantidad }
  const [items, setItems] = useState(leerCarritoGuardado)

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  function agregar(producto) {
    const existe = items.find((item) => item.producto.id === producto.id)
    if (existe) {
      cambiarCantidad(producto.id, existe.cantidad + 1)
    } else {
      setItems([...items, { producto, cantidad: 1 }])
    }
  }

  function quitar(productoId) {
    setItems(items.filter((item) => item.producto.id !== productoId))
  }

  function cambiarCantidad(productoId, cantidad) {
    if (cantidad < 1) return
    setItems(
      items.map((item) => {
        if (item.producto.id !== productoId) return item
        // no se puede pedir mas que el stock
        const nuevaCantidad = Math.min(cantidad, item.producto.stock)
        return { ...item, cantidad: nuevaCantidad }
      })
    )
  }

  function vaciar() {
    setItems([])
  }

  let total = 0
  let cantidadTotal = 0
  for (const item of items) {
    total += item.producto.precio * item.cantidad
    cantidadTotal += item.cantidad
  }

  return (
    <CarritoContext.Provider value={{ items, agregar, quitar, cambiarCantidad, vaciar, total, cantidadTotal }}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}
