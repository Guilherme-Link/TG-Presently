package br.com.fatecid.guidu.presently.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.fatecid.guidu.presently.entity.AttendanceRecord;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByOccurrenceIdAndParticipantId(
        Long occurrenceId,
        Long participantId
    );

}