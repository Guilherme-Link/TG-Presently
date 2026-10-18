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
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final AmbientService ambientService;
    private final EventRepository eventRepository;
    private final ParticipantRepository participantRepository;
    private final AmbientRepository ambientRepository;

    public EventService(
            EventRepository eventRepository,
            ParticipantRepository participantRepository,
            AmbientRepository ambientRepository, AmbientService ambientService) {

        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
        this.ambientRepository = ambientRepository;
        this.ambientService = ambientService;
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

    // Retorna o evento ativo no ambiente, caso exista algum
    // Também já considera a regra de precedência de um evento único sobre um recorrente
    public Optional<Event> findActiveEvent(
            Long ambientId,
            LocalDateTime dateTime) {

        Ambient ambient = ambientService.findById(ambientId);
                
        List<Event> candidates =
                eventRepository.findCandidateActiveEventsByAmbientId(
                        ambient,
                        dateTime.toLocalDate(),
                        dateTime.toLocalTime()
                );

        // Primeiro verifica se existe um evento único ativo.
        Optional<Event> singleEvent = candidates.stream()
                .filter(event -> event.getEventType() == Event.EventType.SINGLE)
                .filter(event -> event.isActive(dateTime))
                .findFirst();

        if (singleEvent.isPresent()) {
            return singleEvent;
        }

        // Caso não exista SINGLE ativo, procura um recorrente.
        return candidates.stream()
                .filter(event -> event.getEventType() == Event.EventType.RECURRING)
                .filter(event -> event.isActive(dateTime))
                .findFirst();
    }


    public String getSecretKeyById(Long id) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Evento não encontrado."));

        return event.getSecretKey();
    }

    @Transactional
    public EventDTO create(EventCreateDTO dto) {

        Event event = new Event();

        // Copia as informações recebidas pelo DTO e gera a chave secreta do evento
        copyDtoToEntity(dto, event);
        validateNoScheduleCollision(event, null);
        event.generateSecretKey();

        event = eventRepository.save(event);

        return new EventDTO(event);
    }

    @Transactional
    public EventDTO update(Long id, EventCreateDTO dto) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Evento não encontrado."));

        copyDtoToEntity(dto, event);
        validateNoScheduleCollision(event, id);

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

    private void validateNoScheduleCollision(Event candidate, Long ignoredEventId) {
        if (candidate.getStartDate() == null || candidate.getEndDate() == null
                || candidate.getStartTime() == null || candidate.getEndTime() == null
                || candidate.getStartDate().isAfter(candidate.getEndDate())
                || candidate.getStartTime().isAfter(candidate.getEndTime())) {
            throw new IllegalArgumentException("Informe um período válido para o evento.");
        }
        if (candidate.getEventType() == Event.EventType.RECURRING && candidate.getIntervalDays() <= 0) {
            throw new IllegalArgumentException("O intervalo da recorrência deve ser maior que zero.");
        }

        for (Event other : eventRepository.findAll()) {
            if (other.getId().equals(ignoredEventId)) {
                continue;
            }

            boolean sameRoom = other.getAmbient().getId().equals(candidate.getAmbient().getId());
            boolean sameResponsible = other.getResponsible().getId().equals(candidate.getResponsible().getId());
            boolean sharedParticipant = candidate.getParticipants().stream()
                    .anyMatch(participant -> other.getParticipants().stream()
                            .anyMatch(otherParticipant -> participant.getId().equals(otherParticipant.getId())));
            if (!sameRoom && !sameResponsible && !sharedParticipant) continue;

            if (!candidate.getStartTime().isBefore(other.getEndTime())
                    || !other.getStartTime().isBefore(candidate.getEndTime())) {
                continue;
            }

            LocalDate date = candidate.getStartDate().isAfter(other.getStartDate())
                    ? candidate.getStartDate() : other.getStartDate();
            LocalDate lastDate = candidate.getEndDate().isBefore(other.getEndDate())
                    ? candidate.getEndDate() : other.getEndDate();
            while (!date.isAfter(lastDate)) {
                if (occursOn(candidate, date) && occursOn(other, date)) {
                    throw new IllegalStateException(
                            "Já existe um evento simultâneo com a mesma sala, responsável ou participante.");
                }
                date = date.plusDays(1);
            }
        }
    }

    private boolean occursOn(Event event, LocalDate date) {
        if (date.isBefore(event.getStartDate()) || date.isAfter(event.getEndDate())) return false;
        if (event.getEventType() == Event.EventType.SINGLE) return true;
        long days = java.time.temporal.ChronoUnit.DAYS.between(event.getStartDate(), date);
        return event.getIntervalDays() > 0 && days % event.getIntervalDays() == 0;
    }

}
