package br.com.fatecid.guidu.presently.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ActiveEventDTO(
    Long id,
    String name,
    LocalDate eventDate,
    LocalTime startTime,
    LocalTime endTime,
    String ambientName,
    String responsibleName
) {
}
