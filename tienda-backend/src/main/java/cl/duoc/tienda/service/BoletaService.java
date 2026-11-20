package cl.duoc.tienda.service;

import cl.duoc.tienda.dto.BoletaRequest;
import cl.duoc.tienda.dto.ItemRequest;
import cl.duoc.tienda.exception.RecursoNoEncontradoException;
import cl.duoc.tienda.exception.ReglaNegocioException;
import cl.duoc.tienda.model.Boleta;
import cl.duoc.tienda.model.DetalleBoleta;
import cl.duoc.tienda.model.Producto;
import cl.duoc.tienda.model.Usuario;
import cl.duoc.tienda.repository.BoletaRepository;
import cl.duoc.tienda.repository.ProductoRepository;
import cl.duoc.tienda.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BoletaService {

    private static final List<String> ESTADOS = List.of("PENDIENTE", "ENVIADA", "ENTREGADA");

    private final BoletaRepository boletaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public BoletaService(BoletaRepository boletaRepository,
                         ProductoRepository productoRepository,
                         UsuarioRepository usuarioRepository) {
        this.boletaRepository = boletaRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // logica principal de la compra:
    // 1. revisa que el carrito no este vacio
    // 2. por cada producto revisa que exista y que tenga stock
    // 3. calcula subtotales y el total
    // 4. descuenta el stock y guarda la boleta con sus detalles
    @Transactional
    public Boleta crearBoleta(String email, BoletaRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ReglaNegocioException("El carrito está vacío");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con email " + email));

        Boleta boleta = new Boleta();
        boleta.setUsuario(usuario);
        boleta.setFecha(LocalDateTime.now());
        boleta.setEstado("PENDIENTE");

        int total = 0;

        for (ItemRequest item : request.getItems()) {
            if (item.getCantidad() <= 0) {
                throw new ReglaNegocioException("La cantidad debe ser al menos 1");
            }

            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("No existe el producto con id " + item.getProductoId()));

            if (producto.getStock() < item.getCantidad()) {
                throw new ReglaNegocioException("No hay stock suficiente de " + producto.getNombre()
                        + " (disponible: " + producto.getStock() + ")");
            }

            int subtotal = producto.getPrecio() * item.getCantidad();

            DetalleBoleta detalle = new DetalleBoleta();
            detalle.setBoleta(boleta);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(subtotal);
            boleta.getDetalles().add(detalle);

            // descontar el stock
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            total = total + subtotal;
        }

        boleta.setTotal(total);
        return boletaRepository.save(boleta);
    }

    public List<Boleta> listar() {
        return boletaRepository.findAllByOrderByFechaDesc();
    }

    public List<Boleta> misBoletas(String email) {
        return boletaRepository.findByUsuarioEmailOrderByFechaDesc(email);
    }

    public Boleta buscarPorId(Long id) {
        return boletaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la boleta con id " + id));
    }

    public Boleta cambiarEstado(Long id, String estado) {
        if (!ESTADOS.contains(estado)) {
            throw new ReglaNegocioException("El estado debe ser PENDIENTE, ENVIADA o ENTREGADA");
        }
        Boleta boleta = buscarPorId(id);
        boleta.setEstado(estado);
        return boletaRepository.save(boleta);
    }

    public void eliminar(Long id) {
        Boleta boleta = buscarPorId(id);
        boletaRepository.delete(boleta);
    }
}
