package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.AttendanceDTO;
import br.com.fatecid.guidu.presently.dto.EventOccurrenceDetailDTO;
import br.com.fatecid.guidu.presently.dto.EventOccurrenceReportDTO;
import br.com.fatecid.guidu.presently.dto.ParticipantAttendanceDTO;
import br.com.fatecid.guidu.presently.entity.AttendanceRecord;
import br.com.fatecid.guidu.presently.entity.EventOccurrence;
import br.com.fatecid.guidu.presently.repository.AttendanceRecordRepository;
import br.com.fatecid.guidu.presently.repository.EventOccurrenceRepository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AttendanceReportService {

    private final EventOccurrenceRepository eventOccurrenceRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public AttendanceReportService(
        EventOccurrenceRepository eventOccurrenceRepository,
        AttendanceRecordRepository attendanceRecordRepository
    ) {
        this.eventOccurrenceRepository = eventOccurrenceRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    
    // Retorna todas as ocorrências de um determinado dia, com filtro opcional pelo id do responsável
    public List<EventOccurrenceReportDTO> findDailyReport(
        LocalDate eventDate,
        Long responsibleId
    ) {

        List<EventOccurrence> occurrences;

        if (responsibleId == null) {
            occurrences =
                eventOccurrenceRepository.findAllByEventDateOrderByStartedAt(
                    eventDate
                );
        } else {
            occurrences =
                eventOccurrenceRepository.findAllByEventDateAndResponsibleId(
                    eventDate,
                    responsibleId
                );
        }

        return occurrences.stream()
            .map(this::toEventOccurrenceReportDTO)
            .toList();
    }

    // Retorna uma ocorrência específica com todas as suas presenças.
    public EventOccurrenceDetailDTO findOccurrence(
        Long occurrenceId
    ) {

        EventOccurrence occurrence =
            eventOccurrenceRepository.findById(occurrenceId)
                .orElseThrow(() ->
                    new IllegalArgumentException(
                        "Ocorrência não encontrada: " + occurrenceId
                    )
                );

        List<AttendanceRecord> attendanceRecords =
            attendanceRecordRepository
                .findAllByOccurrenceIdOrderByParticipantName(
                    occurrenceId
                );

        List<AttendanceDTO> attendances =
            attendanceRecords.stream()
                .map(this::toAttendanceDTO)
                .toList();

        return toEventOccurrenceDetailDTO(
            occurrence,
            attendances
        );
    }

    // Retorna todos os eventos de um determinado dia nos quais o participante possui registro de presença.
    public List<ParticipantAttendanceDTO> findParticipantAttendance(
        Long participantId,
        LocalDate eventDate
    ) {

        List<AttendanceRecord> attendanceRecords =
            attendanceRecordRepository
                .findAllByParticipantIdAndEventDate(
                    participantId,
                    eventDate
                );

        return attendanceRecords.stream()
            .map(this::toParticipantAttendanceDTO)
            .toList();
    }

    private EventOccurrenceReportDTO toEventOccurrenceReportDTO(
        EventOccurrence occurrence
    ) {

        return new EventOccurrenceReportDTO(
            occurrence.getId(),
            occurrence.getEvent().getId(),
            occurrence.getEvent().getName(),
            occurrence.getEventDate(),
            occurrence.getStartedAt(),
            occurrence.getFinishedAt(),
            occurrence.isClosed()
        );
    }

    private EventOccurrenceDetailDTO toEventOccurrenceDetailDTO(
        EventOccurrence occurrence,
        List<AttendanceDTO> attendances
    ) {

        return new EventOccurrenceDetailDTO(
            occurrence.getId(),
            occurrence.getEvent().getId(),
            occurrence.getEvent().getName(),
            occurrence.getEventDate(),
            occurrence.getStartedAt(),
            occurrence.getFinishedAt(),
            occurrence.isClosed(),
            attendances
        );
    }

    private AttendanceDTO toAttendanceDTO(
        AttendanceRecord attendanceRecord
    ) {

        return new AttendanceDTO(
            attendanceRecord.getId(),
            attendanceRecord.getParticipant().getId(),
            attendanceRecord.getParticipant().getName(),
            attendanceRecord.isPresent(),
            attendanceRecord.getCheckInTime()
        );
    }

    private ParticipantAttendanceDTO toParticipantAttendanceDTO(
        AttendanceRecord attendanceRecord
    ) {

        EventOccurrence occurrence =
            attendanceRecord.getOccurrence();

        return new ParticipantAttendanceDTO(
            occurrence.getId(),
            occurrence.getEvent().getId(),
            occurrence.getEvent().getName(),
            occurrence.getEvent().getResponsible().getName(),
            occurrence.getEvent().getAmbient().getName(),
            occurrence.getEventDate(),
            occurrence.getStartedAt(),
            occurrence.getFinishedAt(),
            occurrence.isClosed(),
            attendanceRecord.isPresent(),
            attendanceRecord.getCheckInTime()
        );
    }
}
