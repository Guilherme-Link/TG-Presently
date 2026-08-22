package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    Optional<Participant> findByName(String name);

    Optional<Participant> findByNameContaining(String name);

    boolean existsByName(String name);
}