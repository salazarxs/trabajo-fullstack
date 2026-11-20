package cl.duoc.tienda.controller;

import cl.duoc.tienda.dto.BoletaRequest;
import cl.duoc.tienda.dto.EstadoRequest;
import cl.duoc.tienda.model.Boleta;
import cl.duoc.tienda.service.BoletaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/boletas")
@Tag(name = "Boletas", description = "Compras / órdenes de la tienda")
public class BoletaController {

    private final BoletaService boletaService;

    public BoletaController(BoletaService boletaService) {
        this.boletaService = boletaService;
    }

    @PostMapping
    @Operation(summary = "Comprar (CLIENTE, ADMIN)", description = "Crea la boleta del usuario logueado y descuenta stock")
    public ResponseEntity<Boleta> comprar(@Valid @RequestBody BoletaRequest request, Authentication authentication) {
        Boleta boleta = boletaService.crearBoleta(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(boleta);
    }

    @GetMapping("/mis-boletas")
    @Operation(summary = "Compras del cliente logueado (CLIENTE)")
    public List<Boleta> misBoletas(Authentication authentication) {
        return boletaService.misBoletas(authentication.getName());
    }

    @GetMapping
    @Operation(summary = "Listar todas las boletas (ADMIN, VENDEDOR)")
    public List<Boleta> listar() {
        return boletaService.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una boleta (ADMIN, VENDEDOR)")
    public Boleta buscar(@PathVariable Long id) {
        return boletaService.buscarPorId(id);
    }

    @PutMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de la boleta (ADMIN)", description = "PENDIENTE, ENVIADA o ENTREGADA")
    public Boleta cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest request) {
        return boletaService.cambiarEstado(id, request.getEstado());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar boleta (ADMIN)")
    public Map<String, String> eliminar(@PathVariable Long id) {
        boletaService.eliminar(id);
        return Map.of("mensaje", "Boleta eliminada");
    }
}
