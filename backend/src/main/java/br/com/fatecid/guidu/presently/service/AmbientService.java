package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.AmbientDTO;
import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.entity.Ambient;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.repository.AmbientRepository;
import br.com.fatecid.guidu.presently.repository.EventRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;   
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmbientService {

    private final AmbientRepository repository;
    private final EventRepository eventRepository;

    public AmbientService(AmbientRepository repository, EventRepository eventRepository) {
        this.repository = repository;
        this.eventRepository = eventRepository;
    }

    // Lista todos os ambientes cadastrados
    public List<AmbientDTO> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(AmbientDTO::new)
                .collect(Collectors.toList());
    }

    // Encontra um ambiente pelo ID
    public AmbientDTO findById(Long id) {
        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ambiente não encontrado."));

        return new AmbientDTO(ambient);
    }

    // Verifica se a latitude a longitude fornecidas estão dentro de um determinado ambiente
    public boolean validateInsideAmbient(Long ambientId, double latitude, double longitude) {
        return repository.contains(ambientId, latitude, longitude);
    }

    // Cria um novo ambiente
    public AmbientDTO save(@Valid AmbientDTO dto) {

        Ambient ambient = new Ambient();
        ambient.setName(dto.getName());
        ambient.setDescription(dto.getDescription());
        ambient.setArea(dto.getArea());

        Ambient saved = repository.save(ambient);

        return new AmbientDTO(saved);
    }

    // Atualiza um ambiente
    public AmbientDTO update(Long id, @Valid AmbientDTO dto) {

        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ambiente não encontrado."));

        ambient.setName(dto.getName());
        ambient.setDescription(dto.getDescription());
        ambient.setArea(dto.getArea());

        Ambient updated = repository.save(ambient);

        return new AmbientDTO(updated);
    }

    // Deleta um ambiente pelo ID
    public void delete(Long id) {

        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ambiente não encontrado."));

        if (eventRepository.existsByAmbientId(id)) {
            throw new IllegalStateException(
                    "Não é possível excluir a sala porque ela está vinculada a um ou mais eventos."
            );
        }

        repository.delete(ambient);
    }

    // Lista todos os eventos relacionados a um ambiente pelo ID
    @Transactional(readOnly = true)
    public List<EventDTO> scheduledEvents(long ambientId){
        Ambient ambient = repository.findById(ambientId)
                .orElseThrow(() -> new EntityNotFoundException("Ambiente não encontrado."));

        List<EventDTO> lista = new ArrayList<>();
        for (Event event : ambient.getEvents()) {
            lista.add(new EventDTO(event));
        }

        return lista;
    }
}
