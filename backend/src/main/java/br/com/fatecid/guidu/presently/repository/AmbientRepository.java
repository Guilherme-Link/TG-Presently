package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.Ambient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Extensão do JPArepository, então os métodos padrão de interação com database já estão inclusos
public interface AmbientRepository extends JpaRepository<Ambient, Long> {

    // Implementado automaticamente pelo Spring, não precisa de código extra
    boolean existsByNameIgnoreCase(String name);

    boolean existsByDescriptionIgnoreCase(String description);

    // Query para verificar se um ponto fornecido está dentro da área 
    @Query("""
        SELECT CASE
            WHEN ST_Contains(a.area, ST_SetSRID(ST_Point(:longitude, :latitude), 4326))
            THEN true
            ELSE false
        END
        FROM Ambient a
        WHERE a.id = :id
    """)
    boolean contains(
            @Param("id") Long ambientId,
            @Param("latitude") double latitude,
            @Param("longitude") double longitude
    );

}
