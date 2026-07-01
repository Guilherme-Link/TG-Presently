package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.AmbientDTO;
import br.com.fatecid.guidu.presently.entity.Ambient;
import br.com.fatecid.guidu.presently.repository.AmbientRepository;
import org.springframework.stereotype.Service;

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
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Encontra um ambiente pelo ID
    public AmbientDTO findById(Long id) {
        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));

        return toDTO(ambient);
    }

    // Cria um novo ambiente
    public AmbientDTO save(AmbientDTO dto) {

        Ambient ambient = new Ambient();
        ambient.setName(dto.getName());
        ambient.setDescription(dto.getDescription());

        Ambient saved = repository.save(ambient);

        return toDTO(saved);
    }

    // Atualiza um ambiente
    public AmbientDTO update(Long id, AmbientDTO dto) {

        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));

        ambient.setName(dto.getName());
        ambient.setDescription(dto.getDescription());

        Ambient updated = repository.save(ambient);

        return toDTO(updated);
    }

    // Deleta um ambiente pelo ID
    public void delete(Long id) {

        Ambient ambient = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));

        repository.delete(ambient);
    }

    // Retorna um DTO de ambiente baseado no objeto de ambiente de input
    private AmbientDTO toDTO(Ambient ambient) {
        return new AmbientDTO(
                ambient.getId(),
                ambient.getName(),
                ambient.getDescription()
        );
    }
}