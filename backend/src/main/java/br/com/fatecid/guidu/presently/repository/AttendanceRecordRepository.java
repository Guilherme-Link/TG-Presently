package br.com.fatecid.guidu.presently.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.fatecid.guidu.presently.entity.AttendanceRecord;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByOccurrenceIdAndParticipantId(
        Long occurrenceId,
        Long participantId
    );

    List<AttendanceRecord> findAllByOccurrenceIdOrderByParticipantName(
        Long occurrenceId
    );

    @Query("""
        SELECT a
        FROM AttendanceRecord a
        JOIN FETCH a.occurrence o
        JOIN FETCH o.event e
        JOIN FETCH a.participant p
        WHERE p.id = :participantId
          AND o.eventDate = :eventDate
        ORDER BY o.startedAt
    """)
    List<AttendanceRecord> findAllByParticipantIdAndEventDate(
        @Param("participantId") Long participantId,
        @Param("eventDate") LocalDate eventDate
    );

    @Query("""
        SELECT a
        FROM AttendanceRecord a
        JOIN FETCH a.occurrence o
        JOIN FETCH o.event e
        JOIN FETCH a.participant p
        WHERE p.id = :participantId
          AND o.eventDate BETWEEN :startDate AND :endDate
          AND e.id IN :eventIds
        ORDER BY o.eventDate, o.startedAt
    """)
    List<AttendanceRecord> findAllByParticipantIdAndEventDateBetween(
        @Param("participantId") Long participantId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("eventIds") List<Long> eventIds
    );
}
