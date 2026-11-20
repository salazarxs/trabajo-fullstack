package cl.duoc.tienda.security;

import cl.duoc.tienda.controller.AuthController;
import cl.duoc.tienda.controller.BoletaController;
import cl.duoc.tienda.controller.ProductoController;
import cl.duoc.tienda.controller.UsuarioController;
import cl.duoc.tienda.model.Producto;
import cl.duoc.tienda.model.Usuario;
import cl.duoc.tienda.service.BoletaService;
import cl.duoc.tienda.service.ProductoService;
import cl.duoc.tienda.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// prueba la seguridad de punta a punta: token JWT real -> JwtFilter -> reglas de SecurityConfig -> controlador.
// Los services se reemplazan por mocks, asi que no se necesita la base de datos.
@WebMvcTest(controllers = {ProductoController.class, BoletaController.class, UsuarioController.class, AuthController.class})
@Import({SecurityConfig.class, JwtUtil.class})
class SeguridadIntegracionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @MockitoBean
    private ProductoService productoService;

    @MockitoBean
    private BoletaService boletaService;

    @MockitoBean
    private UsuarioService usuarioService;

    private final Usuario admin = new Usuario("Admin", "admin@tienda.cl", "x", "ADMIN");
    private final Usuario vendedor = new Usuario("Vendedor", "vendedor@tienda.cl", "x", "VENDEDOR");
    private final Usuario cliente = new Usuario("Cliente", "cliente@tienda.cl", "x", "CLIENTE");

    private static final String PRODUCTO_JSON =
            "{\"nombre\":\"Mouse\",\"precio\":9990,\"stock\":5,\"categoria\":{\"id\":1}}";

    @BeforeEach
    void setUp() {
        // el JwtFilter busca al usuario por email para obtener su rol
        for (Usuario u : List.of(admin, vendedor, cliente)) {
            when(usuarioDetailsService.loadUserByUsername(u.getEmail()))
                    .thenReturn(User.withUsername(u.getEmail()).password("x").roles(u.getRol()).build());
        }
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtUtil.generarToken(usuario);
    }

    @Test
    void listarProductos_esPublico() throws Exception {
        when(productoService.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/productos"))
                .andExpect(status().isOk());
    }

    @Test
    void crearProducto_sinToken_devuelve401() throws Exception {
        mockMvc.perform(post("/api/v1/productos").contentType(MediaType.APPLICATION_JSON).content(PRODUCTO_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").exists());
    }

    @Test
    void crearProducto_comoVendedor_devuelve403() throws Exception {
        mockMvc.perform(post("/api/v1/productos")
                        .header("Authorization", bearer(vendedor))
                        .contentType(MediaType.APPLICATION_JSON).content(PRODUCTO_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void crearProducto_comoAdmin_devuelve201() throws Exception {
        when(productoService.crear(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(post("/api/v1/productos")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON).content(PRODUCTO_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Mouse"));
    }

    @Test
    void listarBoletas_comoVendedor_devuelve200() throws Exception {
        when(boletaService.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/boletas").header("Authorization", bearer(vendedor)))
                .andExpect(status().isOk());
    }

    @Test
    void listarBoletas_comoCliente_devuelve403() throws Exception {
        mockMvc.perform(get("/api/v1/boletas").header("Authorization", bearer(cliente)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listarUsuarios_comoCliente_devuelve403() throws Exception {
        mockMvc.perform(get("/api/v1/usuarios").header("Authorization", bearer(cliente)))
                .andExpect(status().isForbidden());
    }

    @Test
    void refreshToken_noSirveComoTokenDeAcceso() throws Exception {
        String refresh = jwtUtil.generarRefreshToken(admin);

        mockMvc.perform(get("/api/v1/usuarios").header("Authorization", "Bearer " + refresh))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenConPayloadAlterado_devuelve401() throws Exception {
        // un cliente intenta hacerse pasar por admin cambiando el payload del token
        // pero mantiene la firma original: la firma ya no coincide y se rechaza
        String[] partes = jwtUtil.generarToken(cliente).split("\\.");
        String payloadFalso = Base64.getUrlEncoder().withoutPadding().encodeToString(
                "{\"sub\":\"admin@tienda.cl\",\"rol\":\"ADMIN\",\"tipo\":\"access\",\"exp\":9999999999}"
                        .getBytes(StandardCharsets.UTF_8));
        String tokenFalso = partes[0] + "." + payloadFalso + "." + partes[2];

        mockMvc.perform(get("/api/v1/usuarios").header("Authorization", "Bearer " + tokenFalso))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_conRefreshTokenValido_entregaTokensNuevos() throws Exception {
        when(usuarioService.buscarPorEmail("cliente@tienda.cl")).thenReturn(cliente);
        String refresh = jwtUtil.generarRefreshToken(cliente);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + refresh + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.rol").value("CLIENTE"));
    }

    @Test
    void refresh_conTokenDeAcceso_devuelve401() throws Exception {
        String access = jwtUtil.generarToken(cliente);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + access + "\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_conJsonMalFormado_devuelve400() throws Exception {
        when(usuarioService.login(anyString(), anyString())).thenReturn(cliente);

        mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{malo"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("El cuerpo de la petición no es válido"));
    }

    @Test
    void productoConIdNoNumerico_devuelve400() throws Exception {
        mockMvc.perform(get("/api/v1/productos/abc"))
                .andExpect(status().isBadRequest());
    }
}
