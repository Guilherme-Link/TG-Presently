package br.com.fatecid.guidu.presently.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.fatecid.guidu.presently.entity.EventOccurrence;

public interface EventOccurrenceRepository extends JpaRepository<EventOccurrence, Long> {

    Optional<EventOccurrence> findByEventIdAndEventDate(
        Long eventId,
        LocalDate eventDate
    );

    List<EventOccurrence> findAllByEventDateOrderByStartedAt(
        LocalDate eventDate
    );

    @Query("""
        SELECT DISTINCT o
        FROM EventOccurrence o
        JOIN o.event e
        JOIN e.responsible r
        WHERE o.eventDate = :eventDate
          AND r.id = :responsibleId
        ORDER BY o.startedAt
    """)
    List<EventOccurrence> findAllByEventDateAndResponsibleId(
        @Param("eventDate") LocalDate eventDate,
        @Param("responsibleId") Long responsibleId
    );

}