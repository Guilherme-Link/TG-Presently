package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.dto.ActiveEventDTO;
import br.com.fatecid.guidu.presently.dto.ParticipantDTO;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.repository.ParticipantRepository;
import br.com.fatecid.guidu.presently.repository.EventRepository;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class ParticipantService {

    private static final ZoneId APP_TIME_ZONE = ZoneId.of("America/Sao_Paulo");

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    public ParticipantService(ParticipantRepository participantRepository, EventRepository eventRepository) {
        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
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
        return eventRepository.findAllByResponsibleIdWithDetails(participantId)
                .stream().map(EventDTO::new).toList();
    }

    // Retorna uma lista dos eventos dos quais o participante é membro
    @Transactional(readOnly = true)
    public List<EventDTO> getParticipatingEvents(Long participantId) {
        return eventRepository.findAllByParticipantIdWithDetails(participantId)
                .stream().map(EventDTO::new).toList();
    }

    // Retorna uma lista consolidada para a tela de presença, evitando duas chamadas ao endpoint.
    @Transactional(readOnly = true)
    public List<EventDTO> getEventsForParticipant(Long participantId) {
        return eventRepository.findAllForParticipantWithDetails(participantId)
                .stream().map(EventDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ActiveEventDTO getCurrentActiveEvent(Long participantId) {
        LocalDateTime now = LocalDateTime.now(APP_TIME_ZONE);
        return eventRepository.findActiveCandidatesForParticipant(
                        participantId,
                        now.toLocalDate(),
                        now.toLocalTime()
                ).stream()
                .filter(event -> event.getEventType() != null)
                .filter(event -> event.getEventType() != Event.EventType.RECURRING
                        || event.getIntervalDays() > 0)
                .filter(event -> event.isActive(now))
                .findFirst()
                .map(event -> new ActiveEventDTO(
                        event.getId(),
                        event.getName(),
                        now.toLocalDate(),
                        event.getStartTime(),
                        event.getEndTime(),
                        event.getAmbient().getName(),
                        event.getResponsible().getName()
                ))
                .orElse(null);
    }

}
