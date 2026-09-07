package br.com.fatecid.guidu.presently.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record EventOccurrenceDetailDTO(
    Long occurrenceId,
    Long eventId,
    String eventName,
    LocalDate eventDate,
    LocalTime startedAt,
    LocalTime finishedAt,
    boolean closed,
    List<AttendanceDTO> attendances
) {
}
