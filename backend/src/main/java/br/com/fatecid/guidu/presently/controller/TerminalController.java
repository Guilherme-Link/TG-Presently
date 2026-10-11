package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.TerminalDTO;
import br.com.fatecid.guidu.presently.dto.TerminalIdentifyRequestDTO;
import br.com.fatecid.guidu.presently.entity.Terminal;
import br.com.fatecid.guidu.presently.service.TerminalService;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/terminals")
public class TerminalController {

    private final TerminalService terminalService;

    public TerminalController(TerminalService terminalService) {
        this.terminalService = terminalService;
    }

    // Registro automático do terminal
    @PostMapping("/identify")
    public ResponseEntity<TerminalDTO> identify(
            @RequestBody TerminalIdentifyRequestDTO request) {

        try {

            terminalService.findByTerminalId(request.terminalId());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);

        } catch (EntityNotFoundException e) {
            
            Terminal terminal = terminalService.create(
                    request.terminalId(),
                    request.name()
            );

            if (!terminal.isApproved()) {
                return ResponseEntity
                        .status(HttpStatus.ACCEPTED)
                        .body(new TerminalDTO(terminal));
            }

            return ResponseEntity.ok(new TerminalDTO(terminal));

        }
    }

    // Retorna todos os terminais
    @GetMapping
    public ResponseEntity<List<TerminalDTO>> findAll() {

        return ResponseEntity.ok(
                terminalService.findAll()
                .stream()
                .map(TerminalDTO::new)
                .toList()
        );
    }

    // Busca um terminal pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<TerminalDTO> findById(
            @PathVariable Long id) {

        Optional<Terminal> terminal =
                terminalService.findById(id);

        if (terminal.isPresent()) {
            return ResponseEntity.ok(new TerminalDTO(terminal.orElseThrow()));
        }
        else{
            return ResponseEntity.notFound().build();
        }
    }

    // Busca terminal pelo terminalId físico
    @GetMapping("/terminal/{terminalId}")
    public ResponseEntity<TerminalDTO> findByTerminalId(
            @PathVariable String terminalId) {

        Terminal terminal = terminalService.findByTerminalId(terminalId);

        return ResponseEntity.ok(new TerminalDTO(terminal)) ;
    }

    // Altera o ambiente do terminal
    @PutMapping("/{id}/updateAmbient")
    public ResponseEntity<TerminalDTO> setAmbient(
            @PathVariable Long id,
            @RequestParam Long ambientId) {

        try {

            Terminal terminal =
                    terminalService.setAmbient(
                            id,
                            ambientId
                    );

            return ResponseEntity.ok(new TerminalDTO(terminal));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.notFound().build();
        }
    }

    // Aprova um terminal
    @PatchMapping("/{id}/approve")
    public ResponseEntity<TerminalDTO> approve(
            @PathVariable Long id) {

        try {

            Terminal terminal =
                    terminalService.approveTerminal(id);

            return ResponseEntity.ok(new TerminalDTO(terminal));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.notFound().build();
        }
    }

    // Deleta um terminal
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        try {

            terminalService.delete(id);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.notFound().build();
        }
    }
}
