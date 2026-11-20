package cl.duoc.tienda.service;

import cl.duoc.tienda.exception.RecursoNoEncontradoException;
import cl.duoc.tienda.exception.ReglaNegocioException;
import cl.duoc.tienda.model.Categoria;
import cl.duoc.tienda.model.Producto;
import cl.duoc.tienda.repository.CategoriaRepository;
import cl.duoc.tienda.repository.DetalleBoletaRepository;
import cl.duoc.tienda.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final DetalleBoletaRepository detalleBoletaRepository;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaRepository categoriaRepository,
                           DetalleBoletaRepository detalleBoletaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.detalleBoletaRepository = detalleBoletaRepository;
    }

    public List<Producto> listar() {
        return productoRepository.findAll();
    }

    // usado por la v2: permite filtrar por categoria y buscar por nombre
    public List<Producto> filtrar(Long categoriaId, String buscar) {
        boolean hayBusqueda = buscar != null && !buscar.isBlank();

        if (categoriaId != null && hayBusqueda) {
            return productoRepository.findByCategoriaIdAndNombreContainingIgnoreCase(categoriaId, buscar);
        }
        if (categoriaId != null) {
            return productoRepository.findByCategoriaId(categoriaId);
        }
        if (hayBusqueda) {
            return productoRepository.findByNombreContainingIgnoreCase(buscar);
        }
        return productoRepository.findAll();
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el producto con id " + id));
    }

    public Producto crear(Producto producto) {
        validar(producto);
        producto.setId(null);
        producto.setCategoria(buscarCategoria(producto));
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, Producto datos) {
        validar(datos);
        Producto producto = buscarPorId(id);
        producto.setNombre(datos.getNombre());
        producto.setDescripcion(datos.getDescripcion());
        producto.setPrecio(datos.getPrecio());
        producto.setStock(datos.getStock());
        producto.setImagen(datos.getImagen());
        producto.setCategoria(buscarCategoria(datos));
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        Producto producto = buscarPorId(id);
        if (detalleBoletaRepository.existsByProductoId(id)) {
            throw new ReglaNegocioException("No se puede eliminar el producto porque está en una boleta");
        }
        productoRepository.delete(producto);
    }

    private void validar(Producto producto) {
        if (producto.getNombre() == null || producto.getNombre().isBlank()) {
            throw new ReglaNegocioException("El nombre del producto es obligatorio");
        }
        if (producto.getPrecio() <= 0) {
            throw new ReglaNegocioException("El precio debe ser mayor a 0");
        }
        if (producto.getStock() < 0) {
            throw new ReglaNegocioException("El stock no puede ser negativo");
        }
        if (producto.getCategoria() == null || producto.getCategoria().getId() == null) {
            throw new ReglaNegocioException("La categoría es obligatoria");
        }
    }

    private Categoria buscarCategoria(Producto producto) {
        Long categoriaId = producto.getCategoria().getId();
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la categoría con id " + categoriaId));
    }
}
