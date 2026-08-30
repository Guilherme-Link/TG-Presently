package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.ParticipantListDTO;
import br.com.fatecid.guidu.presently.service.ParticipantListService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/participantLists")
public class ParticipantListController {

    private final ParticipantListService participantListService;

    public ParticipantListController(
            ParticipantListService participantListService
    ) {
        this.participantListService = participantListService;
    }

    @PostMapping
    public ResponseEntity<ParticipantListDTO> create(
            @RequestBody ParticipantListDTO request
    ) {

        ParticipantListDTO response =
                participantListService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ParticipantListDTO>> findAll() {

        return ResponseEntity.ok(
                participantListService.findAll()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipantListDTO> findById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                participantListService.findById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParticipantListDTO> update(
            @PathVariable Long id,
            @RequestBody ParticipantListDTO request
    ) {

        return ResponseEntity.ok(
                participantListService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        participantListService.delete(id);

        return ResponseEntity.noContent().build();
    }
}