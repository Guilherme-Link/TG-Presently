package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.EventCreateDTO;
import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.service.EventService;
import br.com.fatecid.guidu.presently.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService service;
    private final UserService userService;

    EventController(EventService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    // Retorna a lista de eventos cadastrados
    @GetMapping
    public ResponseEntity<List<EventDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Traz informações de um evento específico baseado no id
    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }


    // Cria um novo evento, recebendo um EventCreateDTO
    @PostMapping
    public ResponseEntity<EventDTO> create(@RequestBody EventCreateDTO dto) {
        EventDTO event = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    // Edita um evento, recebendo um EventCreateDTO
    @PutMapping("/{id}")
    public ResponseEntity<EventDTO> update(
            @PathVariable Long id,
            @RequestBody EventCreateDTO dto) {

        return ResponseEntity.ok(service.update(id, dto));
    }

    // Deleta um evento com base no id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }

    // Lista os eventos em que o ID de usuário fornecido é responsável
    @GetMapping("/responsible/{id}")
    public ResponseEntity<List<EventDTO>> getResponsibleEvents(@PathVariable Long id) {
        List<EventDTO> events = userService.getResponsibleEvents(id);
        return ResponseEntity.ok(events);
    }

    // Lista os eventos em que o ID de usuário fornecido participa
    @GetMapping("/participating/{id}")
    public ResponseEntity<List<EventDTO>> getParticipatingEvents(@PathVariable Long id) {
        List<EventDTO> events = userService.getParticipatingEvents(id);
        return ResponseEntity.ok(events);
    }
}