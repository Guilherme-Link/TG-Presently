package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.entity.Ambient;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.Terminal;
import br.com.fatecid.guidu.presently.repository.AmbientRepository;
import br.com.fatecid.guidu.presently.repository.TerminalRepository;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class TerminalService {

    private final TerminalRepository terminalRepository;
    private final AmbientRepository ambientRepository;
    private final EventService eventService;

    public TerminalService(
            TerminalRepository terminalRepository,
            AmbientRepository ambientRepository, 
            EventService eventService) {

        this.terminalRepository = terminalRepository;
        this.ambientRepository = ambientRepository;
        this.eventService = eventService;
    }

    // Cria um novo terminal
    public Terminal create(String terminalID, String name) {

        // Verifica se já existe um terminal com o mesmo terminalId
        if (terminalRepository
                .findByTerminalId(terminalID)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Já existe um terminal com o terminalId informado."
            );
        }

        // Verifica se já existe um terminal com o mesmo nome
        if (terminalRepository
                .findByName(name)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Já existe um terminal com o nome informado."
            );
        }

        Terminal terminal = new Terminal(terminalID, name, null);

        return terminalRepository.save(terminal);
    }

    // Retorna o id do evento ativo agora no ambiente do terminal - pelo terminalID
    public Long findActiveEventId(String terminalId) {

        Terminal terminal = findByTerminalId(terminalId);

        Ambient ambient = Optional.ofNullable(terminal.getAmbient())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.ACCEPTED,
                "Ambient não configurado para o terminal"
            ));

        Event event = eventService.findActiveEvent(
            ambient.getId(), 
            LocalDateTime.now(ZoneId.of("America/Sao_Paulo"))
        ).orElseThrow();

        return event.getId();
    }

    // Retorna a lista de todos os terminais cadastrados
    public List<Terminal> findAll() {
        return terminalRepository.findAll();
    }

    // Encontra um terminal pelo ID
    public Optional<Terminal> findById(Long id) {
        return terminalRepository.findById(id);
    }

    // Encontra um terminal pelo TerminalID
    public Terminal findByTerminalId(String terminalId) {
        Terminal terminal = terminalRepository.findByTerminalId(terminalId)
                .orElseThrow(() -> new EntityNotFoundException(
                            "Terminal não encontrado."
                ));
        
        return terminal;
    }

    // Update de um terminal - Permite somente atualização de ambiente
    public Terminal setAmbient(Long id, Long newAmbientId) {

        Terminal terminal = terminalRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Terminal não encontrado."
                ));

        Ambient ambient = ambientRepository
                .findById(newAmbientId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Ambiente não encontrado."
                ));

        terminal.setAmbient(ambient);

        return terminalRepository.save(terminal);
    }

    // Aprova um terminal pelo ID
    public Terminal approveTerminal(Long id) {

        Terminal terminal = terminalRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Terminal não encontrado."
                ));

        terminal.setApproved(true);

        return terminalRepository.save(terminal);
    }

    // Deleta um terminal pelo ID
    public void delete(Long id) {

        if (!terminalRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Terminal não encontrado."
            );
        }

        terminalRepository.deleteById(id);
    }
}
