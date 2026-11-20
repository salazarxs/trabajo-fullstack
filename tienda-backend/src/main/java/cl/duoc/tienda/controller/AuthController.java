package cl.duoc.tienda.controller;

import cl.duoc.tienda.dto.AuthResponse;
import cl.duoc.tienda.dto.LoginRequest;
import cl.duoc.tienda.dto.RefreshRequest;
import cl.duoc.tienda.dto.RegistroRequest;
import cl.duoc.tienda.exception.CredencialesInvalidasException;
import cl.duoc.tienda.model.Usuario;
import cl.duoc.tienda.security.JwtUtil;
import cl.duoc.tienda.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación", description = "Login, registro y renovación de tokens JWT")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;

    public AuthController(UsuarioService usuarioService, JwtUtil jwtUtil) {
        this.usuarioService = usuarioService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Devuelve un token de acceso y un refresh token")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.login(request.getEmail(), request.getPassword());
        return crearRespuesta(usuario);
    }

    @PostMapping("/registro")
    @Operation(summary = "Registrar un cliente nuevo", description = "El usuario queda con rol CLIENTE y con la sesión iniciada")
    public ResponseEntity<AuthResponse> registro(@Valid @RequestBody RegistroRequest request) {
        Usuario usuario = usuarioService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(crearRespuesta(usuario));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar el token", description = "Recibe el refresh token y entrega tokens nuevos")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        if (!jwtUtil.esValido(request.getRefreshToken(), "refresh")) {
            throw new CredencialesInvalidasException("El refresh token no es válido o está vencido");
        }
        String email = jwtUtil.obtenerEmail(request.getRefreshToken());
        Usuario usuario = usuarioService.buscarPorEmail(email);
        return crearRespuesta(usuario);
    }

    @GetMapping("/me")
    @Operation(summary = "Datos del usuario logueado")
    public Usuario me(Authentication authentication) {
        return usuarioService.buscarPorEmail(authentication.getName());
    }

    private AuthResponse crearRespuesta(Usuario usuario) {
        String token = jwtUtil.generarToken(usuario);
        String refreshToken = jwtUtil.generarRefreshToken(usuario);
        return new AuthResponse(token, refreshToken, usuario.getId(), usuario.getNombre(),
                usuario.getEmail(), usuario.getRol());
    }
}
