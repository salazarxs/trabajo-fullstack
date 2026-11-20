package cl.duoc.tienda.controller;

import cl.duoc.tienda.model.Producto;
import cl.duoc.tienda.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// version 2 de productos: agrega filtro por categoria y busqueda por nombre
@RestController
@RequestMapping("/api/v2/productos")
@Tag(name = "Productos v2", description = "Listado de productos con filtros")
public class ProductoV2Controller {

    private final ProductoService productoService;

    public ProductoV2Controller(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    @Operation(summary = "Listar productos con filtros (público)",
            description = "Parámetros opcionales: categoriaId y buscar (texto en el nombre)")
    public List<Producto> listar(@RequestParam(required = false) Long categoriaId,
                                 @RequestParam(required = false) String buscar) {
        return productoService.filtrar(categoriaId, buscar);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de un producto (público)")
    public Producto buscar(@PathVariable Long id) {
        return productoService.buscarPorId(id);
    }
}
