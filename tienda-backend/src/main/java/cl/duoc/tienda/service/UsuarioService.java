package cl.duoc.tienda.service;

import cl.duoc.tienda.dto.RegistroRequest;
import cl.duoc.tienda.exception.CredencialesInvalidasException;
import cl.duoc.tienda.exception.RecursoNoEncontradoException;
import cl.duoc.tienda.exception.ReglaNegocioException;
import cl.duoc.tienda.model.Usuario;
import cl.duoc.tienda.repository.BoletaRepository;
import cl.duoc.tienda.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private static final List<String> ROLES = List.of("ADMIN", "VENDEDOR", "CLIENTE");

    private final UsuarioRepository usuarioRepository;
    private final BoletaRepository boletaRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          BoletaRepository boletaRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.boletaRepository = boletaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // revisa email y password, si esta todo bien devuelve el usuario
    public Usuario login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new CredencialesInvalidasException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new CredencialesInvalidasException("Email o contraseña incorrectos");
        }
        return usuario;
    }

    // registro publico desde la tienda: siempre queda como CLIENTE
    public Usuario registrar(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese email");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol("CLIENTE");
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con id " + id));
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con email " + email));
    }

    // crear usuario desde el panel admin (puede elegir el rol)
    public Usuario crear(Usuario usuario) {
        validar(usuario);
        if (usuario.getPassword() == null || usuario.getPassword().length() < 6) {
            throw new ReglaNegocioException("La contraseña debe tener al menos 6 caracteres");
        }
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese email");
        }
        usuario.setId(null);
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Long id, Usuario datos) {
        validar(datos);
        Usuario usuario = buscarPorId(id);

        // si cambia el email hay que revisar que no lo tenga otro usuario
        if (!usuario.getEmail().equals(datos.getEmail()) && usuarioRepository.existsByEmail(datos.getEmail())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese email");
        }

        usuario.setNombre(datos.getNombre());
        usuario.setEmail(datos.getEmail());
        usuario.setRol(datos.getRol());

        // la password solo se cambia si viene una nueva
        if (datos.getPassword() != null && !datos.getPassword().isBlank()) {
            if (datos.getPassword().length() < 6) {
                throw new ReglaNegocioException("La contraseña debe tener al menos 6 caracteres");
            }
            usuario.setPassword(passwordEncoder.encode(datos.getPassword()));
        }
        return usuarioRepository.save(usuario);
    }

    public void eliminar(Long id) {
        Usuario usuario = buscarPorId(id);
        if (boletaRepository.existsByUsuarioId(id)) {
            throw new ReglaNegocioException("No se puede eliminar el usuario porque tiene compras");
        }
        usuarioRepository.delete(usuario);
    }

    private void validar(Usuario usuario) {
        if (usuario.getNombre() == null || usuario.getNombre().isBlank()) {
            throw new ReglaNegocioException("El nombre es obligatorio");
        }
        if (usuario.getEmail() == null || !usuario.getEmail().contains("@")) {
            throw new ReglaNegocioException("El email no es válido");
        }
        if (!ROLES.contains(usuario.getRol())) {
            throw new ReglaNegocioException("El rol debe ser ADMIN, VENDEDOR o CLIENTE");
        }
    }
}
