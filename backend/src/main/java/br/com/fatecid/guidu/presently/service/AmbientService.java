package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.AmbientDTO;
import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.entity.Ambient;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.repository.AmbientRepository;
import br.com.fatecid.guidu.presently.repository.EventRepository;

import jakarta.persistence.EntityNotFoundException;
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

    // Cria um novo ambiente
    public AmbientDTO save(AmbientDTO dto) {
        String name = normalize(dto.getName());
        String description = normalize(dto.getDescription());

        Ambient ambient = new Ambient();
        ambient.setName(name);
        ambient.setDescription(description);

        validateUniqueness(name, description, null);

        Ambient saved = repository.save(ambient);

        return new AmbientDTO(saved);
    }

    // Atualiza um ambiente
    public AmbientDTO update(Long id, AmbientDTO dto) {
        String name = normalize(dto.getName());
        String description = normalize(dto.getDescription());

        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ambiente não encontrado."));

        validateUniqueness(name, description, id);

        ambient.setName(name);
        ambient.setDescription(description);

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

    private void validateUniqueness(String name, String description, Long currentId) {
        boolean duplicateName = currentId == null
                ? repository.existsByNameIgnoreCase(name)
                : repository.existsByNameIgnoreCaseAndIdNot(name, currentId);

        if (duplicateName) {
            throw new IllegalStateException("Já existe um ambiente cadastrado com esse nome.");
        }

        boolean duplicateDescription = currentId == null
                ? repository.existsByDescriptionIgnoreCase(description)
                : repository.existsByDescriptionIgnoreCaseAndIdNot(description, currentId);

        if (duplicateDescription) {
            throw new IllegalStateException("Já existe um ambiente cadastrado com essa descrição.");
        }
    }

    private String normalize(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Os campos de ambiente são obrigatórios.");
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("Os campos de ambiente são obrigatórios.");
        }

        return normalized;
    }
}
