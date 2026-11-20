package cl.duoc.tienda.service;

import cl.duoc.tienda.dto.BoletaRequest;
import cl.duoc.tienda.dto.ItemRequest;
import cl.duoc.tienda.exception.ReglaNegocioException;
import cl.duoc.tienda.model.Boleta;
import cl.duoc.tienda.model.Producto;
import cl.duoc.tienda.model.Usuario;
import cl.duoc.tienda.repository.BoletaRepository;
import cl.duoc.tienda.repository.ProductoRepository;
import cl.duoc.tienda.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoletaServiceTest {

    @Mock
    private BoletaRepository boletaRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private BoletaService boletaService;

    private Usuario cliente;
    private Producto mouse;
    private Producto teclado;

    @BeforeEach
    void setUp() {
        cliente = new Usuario("Cliente", "cliente@tienda.cl", "123456", "CLIENTE");

        mouse = new Producto("Mouse", "mouse usb", 10000, 5, null, null);
        mouse.setId(1L);

        teclado = new Producto("Teclado", "teclado mecanico", 30000, 2, null, null);
        teclado.setId(2L);
    }

    @Test
    void crearBoleta_calculaTotalYDescuentaStock() {
        when(usuarioRepository.findByEmail("cliente@tienda.cl")).thenReturn(Optional.of(cliente));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(mouse));
        when(productoRepository.findById(2L)).thenReturn(Optional.of(teclado));
        when(boletaRepository.save(any(Boleta.class))).thenAnswer(inv -> inv.getArgument(0));

        BoletaRequest request = new BoletaRequest();
        request.setItems(List.of(new ItemRequest(1L, 2), new ItemRequest(2L, 1)));

        Boleta boleta = boletaService.crearBoleta("cliente@tienda.cl", request);

        // 2 x 10000 + 1 x 30000 = 50000
        assertEquals(50000, boleta.getTotal());
        assertEquals(2, boleta.getDetalles().size());
        assertEquals("PENDIENTE", boleta.getEstado());
        assertEquals(3, mouse.getStock());
        assertEquals(1, teclado.getStock());
        verify(boletaRepository).save(any(Boleta.class));
    }

    @Test
    void crearBoleta_sinStockLanzaError() {
        when(usuarioRepository.findByEmail("cliente@tienda.cl")).thenReturn(Optional.of(cliente));
        when(productoRepository.findById(2L)).thenReturn(Optional.of(teclado));

        BoletaRequest request = new BoletaRequest();
        request.setItems(List.of(new ItemRequest(2L, 10)));

        ReglaNegocioException error = assertThrows(ReglaNegocioException.class,
                () -> boletaService.crearBoleta("cliente@tienda.cl", request));

        assertTrue(error.getMessage().contains("No hay stock suficiente"));
        verify(boletaRepository, never()).save(any());
    }

    @Test
    void crearBoleta_carritoVacioLanzaError() {
        BoletaRequest request = new BoletaRequest();

        assertThrows(ReglaNegocioException.class,
                () -> boletaService.crearBoleta("cliente@tienda.cl", request));
    }

    @Test
    void cambiarEstado_estadoInvalidoLanzaError() {
        assertThrows(ReglaNegocioException.class, () -> boletaService.cambiarEstado(1L, "PERDIDA"));
    }
}
