package cl.duoc.tienda.security;

import cl.duoc.tienda.model.Usuario;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil = new JwtUtil("clave-secreta-para-los-tests-de-la-tienda-123", 60000, 120000);

    private Usuario usuario = new Usuario("Admin", "admin@tienda.cl", "123", "ADMIN");

    @Test
    void generarToken_esValidoYTieneElEmail() {
        String token = jwtUtil.generarToken(usuario);

        assertTrue(jwtUtil.esValido(token, "access"));
        assertEquals("admin@tienda.cl", jwtUtil.obtenerEmail(token));
    }

    @Test
    void refreshToken_noSirveComoTokenDeAcceso() {
        String refresh = jwtUtil.generarRefreshToken(usuario);

        assertTrue(jwtUtil.esValido(refresh, "refresh"));
        assertFalse(jwtUtil.esValido(refresh, "access"));
    }

    @Test
    void tokenModificado_noEsValido() {
        String token = jwtUtil.generarToken(usuario) + "abc";

        assertFalse(jwtUtil.esValido(token, "access"));
    }

    @Test
    void tokenVencido_noEsValido() {
        JwtUtil jwtVencido = new JwtUtil("clave-secreta-para-los-tests-de-la-tienda-123", -1000, -1000);
        String token = jwtVencido.generarToken(usuario);

        assertFalse(jwtUtil.esValido(token, "access"));
    }
}
