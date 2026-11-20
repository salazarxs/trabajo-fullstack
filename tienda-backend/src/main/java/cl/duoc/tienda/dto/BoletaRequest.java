package cl.duoc.tienda.dto;

import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.List;

// el carrito que manda el frontend al comprar
public class BoletaRequest {

    @Valid
    private List<ItemRequest> items = new ArrayList<>();

    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }
}
