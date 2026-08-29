package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    Optional<Participant> findByName(String name);

    List<Participant> findAllByCanBeResponsibleTrue();

    List<Participant> findAllByCanBeResponsibleFalse();

    List<Participant> findByNameContainingIgnoreCase(String name);

    List<Participant> findByCanBeResponsibleTrueAndNameContainingIgnoreCase(String name);

    List<Participant> findByCanBeResponsibleFalseAndNameContainingIgnoreCase(String name);

    boolean existsByName(String name);
}