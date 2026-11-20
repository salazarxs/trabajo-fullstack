export function formatearPrecio(numero) {
  return '$' + Number(numero).toLocaleString('es-CL')
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-CL')
}

// saca el mensaje de error que manda el backend: {"mensaje": "..."}
export function mensajeError(error) {
  if (error.response && error.response.data && error.response.data.mensaje) {
    return error.response.data.mensaje
  }
  return 'No se pudo conectar con el servidor'
}
