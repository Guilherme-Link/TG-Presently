package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.ParticipantDTO;
import br.com.fatecid.guidu.presently.service.ParticipantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @GetMapping
    public ResponseEntity<List<ParticipantDTO>> findAll(
        @RequestParam(required = false) Boolean responsible,
        @RequestParam(required = false) String name
    ) {
        return ResponseEntity.ok(
                participantService.findAll(responsible, name)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipantDTO> findById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                participantService.findById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParticipantDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ParticipantDTO dto
    ) {
        return ResponseEntity.ok(
                participantService.update(id, dto)
        );
    }
}