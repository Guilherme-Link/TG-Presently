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

    // Cria um novo ambiente, recebendo um AmbientDTO
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AmbientDTO save(@RequestBody AmbientDTO dto) {
        return service.save(dto);
    }

    // Edita um ambiente com base no ID, recebendo um AmbientDTO
    @PutMapping("/{id}")
    public AmbientDTO update(
            @PathVariable Long id,
            @RequestBody AmbientDTO dto) {

        return service.update(id, dto);
    }

    // Deleta um ambiente, com base no ID
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}