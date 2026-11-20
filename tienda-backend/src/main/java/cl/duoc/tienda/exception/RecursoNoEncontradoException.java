package cl.duoc.tienda.exception;

// se lanza cuando no se encuentra algo en la base de datos (404)
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
