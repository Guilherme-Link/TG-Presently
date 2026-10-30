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

    @Query("""
        SELECT o
        FROM EventOccurrence o
        JOIN FETCH o.event e
        WHERE o.eventDate = :eventDate
        ORDER BY o.startedAt
    """)
    List<EventOccurrence> findAllByEventDateOrderByStartedAt(
        @Param("eventDate") LocalDate eventDate
    );

    @Query("""
        SELECT DISTINCT o
        FROM EventOccurrence o
        JOIN FETCH o.event e
        JOIN FETCH e.responsible r
        WHERE o.eventDate = :eventDate
          AND r.id = :responsibleId
        ORDER BY o.startedAt
    """)
    List<EventOccurrence> findAllByEventDateAndResponsibleId(
        @Param("eventDate") LocalDate eventDate,
        @Param("responsibleId") Long responsibleId
    );

}
