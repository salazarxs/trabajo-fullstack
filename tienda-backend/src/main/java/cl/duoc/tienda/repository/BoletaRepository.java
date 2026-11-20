package cl.duoc.tienda.repository;

import cl.duoc.tienda.model.Boleta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoletaRepository extends JpaRepository<Boleta, Long> {

    List<Boleta> findByUsuarioEmailOrderByFechaDesc(String email);

    List<Boleta> findAllByOrderByFechaDesc();

    boolean existsByUsuarioId(Long usuarioId);
}
