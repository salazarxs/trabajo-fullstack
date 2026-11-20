package cl.duoc.tienda.exception;

// se lanza cuando no se cumple una regla del negocio, por ejemplo stock insuficiente (400)
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
