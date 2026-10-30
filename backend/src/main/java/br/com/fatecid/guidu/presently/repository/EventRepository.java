package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.Ambient;
import br.com.fatecid.guidu.presently.entity.Event;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("""
        SELECT DISTINCT e
        FROM Event e
        LEFT JOIN FETCH e.responsible
        LEFT JOIN FETCH e.ambient
        LEFT JOIN FETCH e.participants
    """)
    List<Event> findAllWithDetails();

    @Query("""
        SELECT DISTINCT e
        FROM Event e
        LEFT JOIN FETCH e.responsible
        LEFT JOIN FETCH e.ambient
        LEFT JOIN FETCH e.participants
        WHERE e.responsible.id = :participantId
    """)
    List<Event> findAllByResponsibleIdWithDetails(@Param("participantId") Long participantId);

    @Query("""
        SELECT DISTINCT e
        FROM Event e
        LEFT JOIN FETCH e.responsible
        LEFT JOIN FETCH e.ambient
        LEFT JOIN FETCH e.participants
        WHERE EXISTS (
            SELECT participant.id
            FROM Event participatingEvent JOIN participatingEvent.participants participant
            WHERE participatingEvent.id = e.id AND participant.id = :participantId
        )
    """)
    List<Event> findAllByParticipantIdWithDetails(@Param("participantId") Long participantId);

    @Query("""
        SELECT DISTINCT e
        FROM Event e
        LEFT JOIN FETCH e.responsible
        LEFT JOIN FETCH e.ambient
        LEFT JOIN FETCH e.participants
        WHERE e.responsible.id = :participantId
           OR EXISTS (
                SELECT participant.id
                FROM Event participatingEvent JOIN participatingEvent.participants participant
                WHERE participatingEvent.id = e.id AND participant.id = :participantId
           )
    """)
    List<Event> findAllForParticipantWithDetails(@Param("participantId") Long participantId);

    // Query para trazer uma lista de todo os eventos possivelmente ativos cadastrados
    @Query("""
    SELECT e
    FROM Event e
    WHERE
        e.startDate <= :date
    AND e.endDate >= :date
    AND e.startTime <= :time
    AND e.endTime >= :time
    """)
    List<Event> findCandidateActiveEvents(
            LocalDate date,
            LocalTime time);


    // Query para trazer uma lista de todo os eventos possivelmente ativos em um determinado ambiente
    @Query("""
    SELECT e
    FROM Event e
    WHERE
        e.ambient = :ambient
    AND e.startDate <= :date
    AND e.endDate >= :date
    AND e.startTime <= :time
    AND e.endTime >= :time
    """)
    List<Event> findCandidateActiveEventsByAmbientId(
            Ambient ambient,
            LocalDate date,
            LocalTime time);

    boolean existsByAmbientId(Long ambientId);
}
