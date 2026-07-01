package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.AmbientDTO;
import br.com.fatecid.guidu.presently.service.AmbientService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ambients")
public class AmbientController {

    private final AmbientService service;

    public AmbientController(AmbientService service) {
        this.service = service;
    }

    @GetMapping
    public List<AmbientDTO> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public AmbientDTO findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AmbientDTO save(@RequestBody AmbientDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public AmbientDTO update(
            @PathVariable Long id,
            @RequestBody AmbientDTO dto) {

        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}