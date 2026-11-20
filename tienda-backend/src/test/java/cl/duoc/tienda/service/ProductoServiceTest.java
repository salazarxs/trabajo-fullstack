package cl.duoc.tienda.service;

import cl.duoc.tienda.exception.RecursoNoEncontradoException;
import cl.duoc.tienda.exception.ReglaNegocioException;
import cl.duoc.tienda.model.Categoria;
import cl.duoc.tienda.model.Producto;
import cl.duoc.tienda.repository.CategoriaRepository;
import cl.duoc.tienda.repository.DetalleBoletaRepository;
import cl.duoc.tienda.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private DetalleBoletaRepository detalleBoletaRepository;

    @InjectMocks
    private ProductoService productoService;

    @Test
    void buscarPorId_noExisteLanzaError() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> productoService.buscarPorId(99L));
    }

    @Test
    void crear_precioCeroLanzaError() {
        Categoria categoria = new Categoria("Accesorios");
        categoria.setId(1L);
        Producto producto = new Producto("Mouse", "", 0, 10, null, categoria);

        assertThrows(ReglaNegocioException.class, () -> productoService.crear(producto));
        verify(productoRepository, never()).save(any());
    }

    @Test
    void crear_guardaConLaCategoria() {
        Categoria categoria = new Categoria("Accesorios");
        categoria.setId(1L);
        Producto producto = new Producto("Mouse", "", 9990, 10, null, categoria);

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        Producto guardado = productoService.crear(producto);

        assertEquals("Accesorios", guardado.getCategoria().getNombre());
    }

    @Test
    void eliminar_productoEnBoletaLanzaError() {
        Producto producto = new Producto("Mouse", "", 9990, 10, null, null);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(detalleBoletaRepository.existsByProductoId(1L)).thenReturn(true);

        assertThrows(ReglaNegocioException.class, () -> productoService.eliminar(1L));
        verify(productoRepository, never()).delete(any());
    }
}
