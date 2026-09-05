package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.AttendanceTodayItemDTO;
import br.com.fatecid.guidu.presently.entity.AttendanceRecord;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.EventOccurrence;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.repository.AttendanceRecordRepository;
import br.com.fatecid.guidu.presently.repository.EventOccurrenceRepository;
import br.com.fatecid.guidu.presently.repository.ParticipantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final ParticipantRepository participantRepository;
    private final EventOccurrenceRepository occurrenceRepository;
    private final AttendanceRecordRepository recordRepository;

    public AttendanceService(
            ParticipantRepository participantRepository,
            EventOccurrenceRepository occurrenceRepository,
            AttendanceRecordRepository recordRepository) {
        this.participantRepository = participantRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.recordRepository = recordRepository;
    }

    @Transactional(readOnly = true)
    public List<AttendanceTodayItemDTO> getTodayAttendance(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado."));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Map<Long, Event> eventsById = new LinkedHashMap<>();
        participant.getResponsibleEvents().forEach(event -> eventsById.putIfAbsent(event.getId(), event));
        participant.getParticipatingEvents().forEach(event -> eventsById.putIfAbsent(event.getId(), event));

        return eventsById.values()
                .stream()
                .filter(event -> !today.isBefore(event.getStartDate()) && !today.isAfter(event.getEndDate()))
                .sorted(Comparator.comparing(Event::getStartTime))
                .map(event -> toItem(event, participantId, today, now))
                .sorted(Comparator
                        .comparingInt((AttendanceTodayItemDTO item) -> statusRank(item.getStatus()))
                        .thenComparing(AttendanceTodayItemDTO::getTime))
                .toList();
    }

    private AttendanceTodayItemDTO toItem(Event event, Long participantId, LocalDate today, LocalTime now) {
        EventOccurrence occurrence = occurrenceRepository.findByEventIdAndEventDate(event.getId(), today)
                .orElse(null);

        AttendanceRecord record = occurrence == null
                ? null
                : recordRepository.findByOccurrenceIdAndParticipantId(occurrence.getId(), participantId).orElse(null);

        boolean present = record != null && record.isPresent();
        boolean beforeStart = now.isBefore(event.getStartTime());
        boolean activeNow = !now.isBefore(event.getStartTime()) && !now.isAfter(event.getEndTime());

        String status;
        String detail;
        String checkInTime = "";

        if (present) {
            status = "confirmed";
            checkInTime = record.getCheckInTime() != null
                    ? record.getCheckInTime().toLocalTime().format(TIME_FORMATTER)
                    : "";
            detail = checkInTime.isBlank()
                    ? "Presença confirmada"
                    : "Presença confirmada às " + checkInTime;
        } else if (beforeStart || activeNow) {
            status = "pending";
            detail = beforeStart ? "Aguardando..." : "Aguardando leitura do QR Code";
        } else {
            status = "missing";
            detail = "Presença não informada";
        }

        return new AttendanceTodayItemDTO(
                event.getId(),
                event.getName(),
                formatEventTime(event),
                event.getAmbient() != null ? event.getAmbient().getName() : "Sala não informada",
                event.getResponsible() != null ? event.getResponsible().getName() : "Responsável não informado",
                status,
                detail,
                checkInTime
        );
    }

    private String formatEventTime(Event event) {
        if (event.getStartTime() != null && event.getEndTime() != null) {
            return event.getStartTime().format(TIME_FORMATTER) + " - " + event.getEndTime().format(TIME_FORMATTER);
        }

        if (event.getStartTime() != null) {
            return event.getStartTime().format(TIME_FORMATTER);
        }

        if (event.getEndTime() != null) {
            return event.getEndTime().format(TIME_FORMATTER);
        }

        return "—";
    }

    private int statusRank(String status) {
        if ("confirmed".equals(status)) {
            return 0;
        }

        if ("pending".equals(status)) {
            return 1;
        }

        return 2;
    }
}
