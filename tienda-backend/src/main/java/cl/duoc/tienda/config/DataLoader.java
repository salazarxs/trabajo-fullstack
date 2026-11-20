package cl.duoc.tienda.config;

import cl.duoc.tienda.model.Categoria;
import cl.duoc.tienda.model.Producto;
import cl.duoc.tienda.model.Usuario;
import cl.duoc.tienda.repository.CategoriaRepository;
import cl.duoc.tienda.repository.ProductoRepository;
import cl.duoc.tienda.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// carga datos de prueba la primera vez que se levanta la aplicacion
@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UsuarioRepository usuarioRepository,
                      CategoriaRepository categoriaRepository,
                      ProductoRepository productoRepository,
                      PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(new Usuario("Administrador", "admin@tienda.cl", passwordEncoder.encode("admin123"), "ADMIN"));
            usuarioRepository.save(new Usuario("Vendedor", "vendedor@tienda.cl", passwordEncoder.encode("vendedor123"), "VENDEDOR"));
            usuarioRepository.save(new Usuario("Cliente Prueba", "cliente@tienda.cl", passwordEncoder.encode("cliente123"), "CLIENTE"));
            System.out.println("Usuarios de prueba creados");
        }

        if (categoriaRepository.count() == 0) {
            Categoria computacion = categoriaRepository.save(new Categoria("Computación"));
            Categoria celulares = categoriaRepository.save(new Categoria("Celulares"));
            Categoria accesorios = categoriaRepository.save(new Categoria("Accesorios"));

            productoRepository.save(new Producto("Notebook Lenovo IdeaPad 3", "Notebook 15.6\" Ryzen 5, 8GB RAM, 512GB SSD",
                    499990, 10, "https://placehold.co/400x300?text=Notebook", computacion));
            productoRepository.save(new Producto("Monitor Samsung 24\"", "Monitor Full HD 75Hz con panel IPS",
                    129990, 15, "https://placehold.co/400x300?text=Monitor", computacion));
            productoRepository.save(new Producto("Teclado mecánico Redragon", "Teclado mecánico switches red, retroiluminado",
                    39990, 25, "https://placehold.co/400x300?text=Teclado", computacion));
            productoRepository.save(new Producto("Samsung Galaxy A55", "Pantalla 6.6\", 128GB, cámara 50MP",
                    349990, 8, "https://placehold.co/400x300?text=Galaxy+A55", celulares));
            productoRepository.save(new Producto("Xiaomi Redmi Note 13", "Pantalla AMOLED 6.67\", 256GB",
                    229990, 12, "https://placehold.co/400x300?text=Redmi+Note+13", celulares));
            productoRepository.save(new Producto("Audífonos Bluetooth JBL", "Audífonos inalámbricos con 40 horas de batería",
                    44990, 30, "https://placehold.co/400x300?text=Audifonos", accesorios));
            productoRepository.save(new Producto("Mouse Logitech M170", "Mouse inalámbrico USB",
                    9990, 50, "https://placehold.co/400x300?text=Mouse", accesorios));
            productoRepository.save(new Producto("Cargador USB-C 25W", "Cargador rápido compatible con Samsung y Xiaomi",
                    14990, 40, "https://placehold.co/400x300?text=Cargador", accesorios));
            System.out.println("Categorías y productos de prueba creados");
        }
    }
}
