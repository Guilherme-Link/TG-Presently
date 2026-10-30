package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.EventOccurrenceDetailDTO;
import br.com.fatecid.guidu.presently.dto.EventOccurrenceReportDTO;
import br.com.fatecid.guidu.presently.dto.ParticipantAttendanceDTO;
import br.com.fatecid.guidu.presently.service.AttendanceReportService;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attendanceReport")
public class AttendanceReportController {

    private final AttendanceReportService attendanceReportService;

    public AttendanceReportController(
        AttendanceReportService attendanceReportService
    ) {
        this.attendanceReportService = attendanceReportService;
    }

    @GetMapping("/report")
    public List<EventOccurrenceReportDTO> report(
        @RequestParam
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate date,

        @RequestParam(required = false)
        Long responsibleId
    ) {

        return attendanceReportService.findDailyReport(
            date,
            responsibleId
        );
    }

    @GetMapping("/{occurrenceId}")
    public EventOccurrenceDetailDTO findOccurrence(
        @PathVariable Long occurrenceId
    ) {

        return attendanceReportService.findOccurrence(
            occurrenceId
        );
    }

    @GetMapping("/participants/{participantId}")
    public List<ParticipantAttendanceDTO> findParticipantAttendance(
        @PathVariable Long participantId,

        @RequestParam
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate date
    ) {

        return attendanceReportService.findParticipantAttendance(
            participantId,
            date
        );
    }

    @GetMapping("/participants/{participantId}/range")
    public List<ParticipantAttendanceDTO> findParticipantAttendanceBetween(
        @PathVariable Long participantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam List<Long> eventIds
    ) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("O início do período deve ser anterior ao fim.");
        }
        return attendanceReportService.findParticipantAttendanceBetween(
            participantId,
            startDate,
            endDate,
            eventIds
        );
    }
}
