package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.AmbientDTO;
import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.entity.Ambient;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.repository.AmbientRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmbientService {

    private final AmbientRepository repository;

    public AmbientService(AmbientRepository repository) {
        this.repository = repository;
    }

    // Lista todos os ambientes cadastrados
    public List<AmbientDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(AmbientDTO::new)
                .collect(Collectors.toList());
    }

    // Encontra um ambiente pelo ID
    public AmbientDTO findById(Long id) {
        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));

        return new AmbientDTO(ambient);
    }

    // Verifica se a latitude a longitude fornecidas estão dentro de um determinado ambiente
    public boolean validateInsideAmbient(Long ambientId, double latitude, double longitude) {
        return repository.contains(ambientId, latitude, longitude);
    }

    // Cria um novo ambiente
    public AmbientDTO save(AmbientDTO dto) {

        Ambient ambient = new Ambient();
        ambient.setName(dto.getName());
        ambient.setDescription(dto.getDescription());
        ambient.setArea(dto.getArea());

        Ambient saved = repository.save(ambient);

        return new AmbientDTO(saved);
    }

    // Atualiza um ambiente
    public AmbientDTO update(Long id, AmbientDTO dto) {

        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));

        ambient.setName(dto.getName());
        ambient.setDescription(dto.getDescription());
        ambient.setArea(dto.getArea());

        Ambient updated = repository.save(ambient);

        return new AmbientDTO(updated);
    }

    // Deleta um ambiente pelo ID
    public void delete(Long id) {

        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));

        repository.delete(ambient);
    }

    // Lista todos os eventos relacionados a um ambiente pelo ID
    @Transactional(readOnly = true)
    public List<EventDTO> scheduledEvents(long ambientId){
        Ambient ambient = repository.findById(ambientId)
                .orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));

        List<EventDTO> lista = new ArrayList<>();
        for (Event event : ambient.getEvents()) {
            lista.add(new EventDTO(event));
        }

    return lista;
    }
}