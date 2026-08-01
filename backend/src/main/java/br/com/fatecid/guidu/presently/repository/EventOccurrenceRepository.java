package br.com.fatecid.guidu.presently.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fatecid.guidu.presently.entity.EventOccurrence;

public interface EventOccurrenceRepository extends JpaRepository<EventOccurrence, Long> {

    Optional<EventOccurrence> findByEventIdAndDate(
        Long eventId,
        LocalDate date
    );

}