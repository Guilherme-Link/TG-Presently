package br.com.fatecid.guidu.presently.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ParticipantAttendanceDTO(
    Long occurrenceId,
    Long eventId,
    String eventName,
    String responsible,
    String ambient,
    LocalDate eventDate,
    LocalTime startedAt,
    LocalTime finishedAt,
    boolean closed,
    boolean present,
    LocalDateTime checkInTime
) {
}
