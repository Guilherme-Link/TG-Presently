package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.Ambient;
import org.springframework.data.jpa.repository.JpaRepository;

// Extensão do JPArepository, então os métodos padrão de interação com database já estão inclusos
public interface AmbientRepository extends JpaRepository<Ambient, Long> {

    // Implementado automaticamente pelo Spring, não precisa de código extra
    boolean existsByName(String name);

}