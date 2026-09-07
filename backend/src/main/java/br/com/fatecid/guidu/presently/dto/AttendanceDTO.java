package br.com.fatecid.guidu.presently.dto;

import java.time.LocalDateTime;

public record AttendanceDTO(
    Long attendanceId,
    Long participantId,
    String participantName,
    boolean present,
    LocalDateTime checkInTime
) {
}
