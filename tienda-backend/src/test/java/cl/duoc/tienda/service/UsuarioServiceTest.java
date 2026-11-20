package cl.duoc.tienda.service;

import cl.duoc.tienda.dto.RegistroRequest;
import cl.duoc.tienda.exception.CredencialesInvalidasException;
import cl.duoc.tienda.exception.ReglaNegocioException;
import cl.duoc.tienda.model.Usuario;
import cl.duoc.tienda.repository.BoletaRepository;
import cl.duoc.tienda.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private BoletaRepository boletaRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioService(usuarioRepository, boletaRepository, passwordEncoder);
    }

    @Test
    void registrar_guardaComoClienteYEncriptaPassword() {
        RegistroRequest request = new RegistroRequest();
        request.setNombre("Juan");
        request.setEmail("juan@mail.cl");
        request.setPassword("secreto123");

        when(usuarioRepository.existsByEmail("juan@mail.cl")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario usuario = usuarioService.registrar(request);

        assertEquals("CLIENTE", usuario.getRol());
        assertNotEquals("secreto123", usuario.getPassword());
        assertTrue(passwordEncoder.matches("secreto123", usuario.getPassword()));
    }

    @Test
    void registrar_emailRepetidoLanzaError() {
        RegistroRequest request = new RegistroRequest();
        request.setNombre("Juan");
        request.setEmail("juan@mail.cl");
        request.setPassword("secreto123");

        when(usuarioRepository.existsByEmail("juan@mail.cl")).thenReturn(true);

        assertThrows(ReglaNegocioException.class, () -> usuarioService.registrar(request));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void login_passwordIncorrectaLanzaError() {
        Usuario usuario = new Usuario("Juan", "juan@mail.cl", passwordEncoder.encode("secreto123"), "CLIENTE");
        when(usuarioRepository.findByEmail("juan@mail.cl")).thenReturn(Optional.of(usuario));

        assertThrows(CredencialesInvalidasException.class, () -> usuarioService.login("juan@mail.cl", "otra"));
    }

    @Test
    void crear_rolInvalidoLanzaError() {
        Usuario usuario = new Usuario("Juan", "juan@mail.cl", "secreto123", "JEFE");

        assertThrows(ReglaNegocioException.class, () -> usuarioService.crear(usuario));
    }
}
