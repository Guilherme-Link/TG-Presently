package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.AmbientDTO;
import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.service.AmbientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ambients")
public class AmbientController {

    private final AmbientService service;

    public AmbientController(AmbientService service) {
        this.service = service;
    }

    // Retorna uma lista de todos os ambientes cadastrados
    @GetMapping
    public List<AmbientDTO> findAll() {
        return service.findAll();
    }

    // Retorna detalhes de um ambiente específico pelo ID
    @GetMapping("/{id}")
    public AmbientDTO findById(@PathVariable Long id) {
        return service.findById(id);
    }

    // Retorna os eventos programados para um ambiente específico pelo ID
    @GetMapping("schedule/{id}")
    public ResponseEntity<List<EventDTO>> scheduledEvents(@PathVariable Long id) {
        return ResponseEntity.ok(service.scheduledEvents(id));
    }

    // Cria um novo ambiente, recebendo um AmbientDTO
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AmbientDTO save(@Valid @RequestBody AmbientDTO dto) {
        return service.save(dto);
    }

    // Edita um ambiente com base no ID, recebendo um AmbientDTO
    @PutMapping("/{id}")
    public AmbientDTO update(
            @PathVariable Long id,
            @Valid @RequestBody AmbientDTO dto) {

        return service.update(id, dto);
    }

    // Deleta um ambiente, com base no ID
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
