package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

// Extensão do JPArepository, então os métodos padrão de interação com database já estão inclusos

    // Implementado automaticamente pelo Spring, não precisa de código extra
    Optional<User> findByUsername(String username);

    // Implementado automaticamente pelo Spring, não precisa de código extra
    boolean existsByUsername(String username);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

   

}
