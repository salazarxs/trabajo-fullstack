package cl.duoc.tienda.exception;

// se lanza cuando el login o el refresh token no son validos (401)
public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}
