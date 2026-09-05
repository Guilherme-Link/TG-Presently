package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.AttendanceTodayItemDTO;
import br.com.fatecid.guidu.presently.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/today/{participantId}")
    public ResponseEntity<List<AttendanceTodayItemDTO>> getTodayAttendance(@PathVariable Long participantId) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(participantId));
    }
}
