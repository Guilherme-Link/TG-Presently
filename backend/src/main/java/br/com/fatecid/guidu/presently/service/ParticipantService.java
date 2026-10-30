package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.dto.ParticipantDTO;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.repository.ParticipantRepository;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    public ParticipantService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    // Busca unificada por participantes, permitindo filtros por nome e possibilidade de ser responsável
    public List<ParticipantDTO> findAll(Boolean canBeResponsible, String name) {

        List<Participant> participants = new ArrayList<>();

        if (canBeResponsible == null){
            if(name == null) participants = participantRepository.findAll();
            else participants = participantRepository.findByNameContainingIgnoreCase(name);
        }
        else if (canBeResponsible == true){
            if(name == null) participants = participantRepository.findAllByCanBeResponsibleTrue();
            else participants = participantRepository.findByCanBeResponsibleTrueAndNameContainingIgnoreCase(name);
        }
        else {
            if(name == null) participants = participantRepository.findAllByCanBeResponsibleFalse();
            else participants = participantRepository.findByCanBeResponsibleFalseAndNameContainingIgnoreCase(name);
        }

        return participants
                .stream()
                .map(ParticipantDTO::new)
                .toList();
    }

    public ParticipantDTO findById(Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Participante não encontrado com o id: " + id)
                );

        return new ParticipantDTO(participant);
    }

    // Encontra retorna o participante do ID fornecido caso ele esteja inativo
    public Participant findInactiveById(Long id) {

        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                    new IllegalArgumentException("ID de participante fornecido não existe")
                );

        if (participant.isActive()){
            throw new IllegalArgumentException("O participante referenciado ainda está ativo");
        }

        return participant;
    }

    public ParticipantDTO create(ParticipantDTO dto) {

        if (participantRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Já existe um participante com esse nome");
        }

        Participant participant = new Participant();

        participant.setName(dto.getName());
        participant.setCanBeResponsible(dto.isCanBeResponsible());

        Participant savedParticipant = participantRepository.save(participant);

        return new ParticipantDTO(savedParticipant);
    }

    public ParticipantDTO update(Long id, ParticipantDTO dto) {

        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Participante não encontrado com o id: " + id)
                );

        if (!participant.getName().equals(dto.getName())
                && participantRepository.existsByName(dto.getName())) {

            throw new RuntimeException("Já existe um participante com esse nome");
        }

        participant.setName(dto.getName());
        participant.setCanBeResponsible(dto.isCanBeResponsible());

        Participant updatedParticipant = participantRepository.save(participant);

        return new ParticipantDTO(updatedParticipant);
    }

    // Retorna uma lista dos eventos pelos quais o participante é reponsável
    @Transactional(readOnly = true)
    public List<EventDTO> getResponsibleEvents(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        //Precisa da conversão de eventos para EventDTO para evitar referência circular na resposta
        List<EventDTO> lista = new ArrayList<>();
        for (Event event : participant.getResponsibleEvents()) {
            lista.add(new EventDTO(event));
        }

        return lista;
    }

    // Retorna uma lista dos eventos dos quais o participante é membro
    @Transactional(readOnly = true)
    public List<EventDTO> getParticipatingEvents(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));


        //Precisa da conversão de eventos para EventDTO para evitar referência circular na resposta
        List<EventDTO> lista = new ArrayList<>();
        for (Event event : participant.getParticipatingEvents()) {
            lista.add(new EventDTO(event));
        }

        return lista;
    }

    // Retorna uma lista consolidada para a tela de presença, evitando duas chamadas ao endpoint.
    @Transactional(readOnly = true)
    public List<EventDTO> getEventsForParticipant(Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        LinkedHashMap<Long, Event> eventsById = new LinkedHashMap<>();
        participant.getResponsibleEvents().forEach(event -> eventsById.put(event.getId(), event));
        participant.getParticipatingEvents().forEach(event -> eventsById.putIfAbsent(event.getId(), event));

        return eventsById.values().stream().map(EventDTO::new).toList();
    }

}
