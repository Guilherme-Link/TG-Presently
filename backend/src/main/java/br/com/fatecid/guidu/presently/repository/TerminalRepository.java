package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.Terminal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TerminalRepository extends JpaRepository<Terminal, Long> {

    Optional<Terminal> findByTerminalId(String terminalId);

    Optional<Terminal> findByName(String name);
}
