package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.EventCreateDTO;
import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.entity.Ambient;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.repository.AmbientRepository;
import br.com.fatecid.guidu.presently.repository.EventRepository;
import br.com.fatecid.guidu.presently.repository.ParticipantRepository;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ParticipantRepository participantRepository;
    private final AmbientRepository ambientRepository;

    public EventService(
            EventRepository eventRepository,
            ParticipantRepository participantRepository,
            AmbientRepository ambientRepository) {

        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
        this.ambientRepository = ambientRepository;
    }

    public List<EventDTO> findAll() {
        return eventRepository.findAll()
                .stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }

    public Event findById(Long id) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Evento não encontrado."));

        return event;
    }

    public String getSecretKeyById(Long id) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Evento não encontrado."));

        return event.getSecretKey();
    }

    public EventDTO create(EventCreateDTO dto) {

        Event event = new Event();

        // Copia as informações recebidas pelo DTO e gera a chave secreta do evento
        copyDtoToEntity(dto, event);
        event.generateSecretKey();

        event = eventRepository.save(event);

        return new EventDTO(event);
    }

    public EventDTO update(Long id, EventCreateDTO dto) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Evento não encontrado."));

        copyDtoToEntity(dto, event);

        event = eventRepository.save(event);

        return new EventDTO(event);
    }

    public void delete(Long id) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Evento não encontrado."));

        eventRepository.delete(event);
    }

    private void copyDtoToEntity(EventCreateDTO dto, Event event) {

        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setEventType(dto.getEventType());
        event.setIntervalDays(dto.getIntervalDays());

        Participant responsible = participantRepository.findById(dto.getResponsibleId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Usuário responsável não encontrado."));

        event.setResponsible(responsible);

        Ambient ambient = ambientRepository.findById(dto.getAmbientId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Ambiente não encontrado."));

        event.setAmbient(ambient);

        Set<Participant> participants = new HashSet<>();

        if (dto.getParticipantIds() != null) {

            for (Long participantId : dto.getParticipantIds()) {

                Participant participant = participantRepository.findById(participantId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Participante não encontrado. Id: " + participantId));

                participants.add(participant);
            }
        }

        event.setParticipants(participants);
    }

}