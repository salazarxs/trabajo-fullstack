package cl.duoc.tienda.controller;

import cl.duoc.tienda.model.Producto;
import cl.duoc.tienda.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/productos")
@Tag(name = "Productos v1", description = "CRUD de productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    @Operation(summary = "Listar productos (público)")
    public List<Producto> listar() {
        return productoService.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de un producto (público)")
    public Producto buscar(@PathVariable Long id) {
        return productoService.buscarPorId(id);
    }

    @PostMapping
    @Operation(summary = "Crear producto (ADMIN)")
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(producto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto (ADMIN)")
    public Producto actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        return productoService.actualizar(id, producto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto (ADMIN)")
    public Map<String, String> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return Map.of("mensaje", "Producto eliminado");
    }
}
