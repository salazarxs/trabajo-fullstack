package cl.duoc.tienda.security;

import cl.duoc.tienda.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// clase encargada de crear y validar los tokens JWT
@Component
public class JwtUtil {

    private final SecretKey clave;
    private final long expiracion;
    private final long expiracionRefresh;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiracion}") long expiracion,
                   @Value("${jwt.expiracion-refresh}") long expiracionRefresh) {
        this.clave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiracion = expiracion;
        this.expiracionRefresh = expiracionRefresh;
    }

    // token de acceso, dura poco (1 hora)
    public String generarToken(Usuario usuario) {
        return crearToken(usuario, "access", expiracion);
    }

    // refresh token, dura mas (7 dias) y solo sirve para pedir un token nuevo
    public String generarRefreshToken(Usuario usuario) {
        return crearToken(usuario, "refresh", expiracionRefresh);
    }

    private String crearToken(Usuario usuario, String tipo, long duracion) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("rol", usuario.getRol())
                .claim("tipo", tipo)
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + duracion))
                .signWith(clave)
                .compact();
    }

    // lee el token, si la firma no es correcta o esta vencido lanza una excepcion
    private Claims leerClaims(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String obtenerEmail(String token) {
        return leerClaims(token).getSubject();
    }

    // devuelve true si el token es valido y es del tipo que se pide (access o refresh)
    public boolean esValido(String token, String tipo) {
        try {
            Claims claims = leerClaims(token);
            return tipo.equals(claims.get("tipo", String.class));
        } catch (Exception e) {
            return false;
        }
    }
}
