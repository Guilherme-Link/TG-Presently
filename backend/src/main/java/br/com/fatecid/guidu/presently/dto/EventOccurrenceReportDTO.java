package br.com.fatecid.guidu.presently.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventOccurrenceReportDTO(
    Long occurrenceId,
    Long eventId,
    String eventName,
    LocalDate eventDate,
    LocalTime startedAt,
    LocalTime finishedAt,
    boolean closed
) {
}
