package br.com.fatecid.guidu.presently.service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

import br.com.fatecid.guidu.presently.entity.AttendanceRecord;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.EventOccurrence;
import br.com.fatecid.guidu.presently.entity.User;
import br.com.fatecid.guidu.presently.repository.EventOccurrenceRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class EventOccurrenceService {

    private final EventOccurrenceRepository repository;

    public EventOccurrenceService(EventOccurrenceRepository repository) {
        this.repository = repository;
    }

    public List<EventOccurrence> findAll() {
        return repository.findAll();
    }


    public EventOccurrence findById(Long id) {
        EventOccurrence occurrence = repository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Ocorrência de evento não encontrada."));

        return occurrence;
    }

    // Cria uma nova ocorrência de evento a partir de um evento e uma data de ocorrência
    public EventOccurrence createFromEvent(Event event, LocalDate date) {

        EventOccurrence occurrence = new EventOccurrence();

        // Copia as informações do evento para a ocorrência
        occurrence.setEvent(event);
        occurrence.setEventDate(date);
        occurrence.setStartedAt(event.getStartTime());
        occurrence.setFinishedAt(event.getEndTime());
        occurrence.setClosed(false);

        // Copia a lista de participantes do evento e deixa todos por padrão como ausentes
        for (User participant : event.getParticipants()) {

            AttendanceRecord record = new AttendanceRecord();

            record.setParticipant(participant);
            record.setPresent(false);

            occurrence.addAttendanceRecord(record);
        }

        return repository.save(occurrence);
    }

    // Atualiza uma ocorrência existente.
    public EventOccurrence update(Long id, EventOccurrence occurrence) {
        EventOccurrence existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrência não encontrada."));

        existing.setEvent(occurrence.getEvent());
        existing.setEventDate(occurrence.getEventDate());
        existing.setStartedAt(occurrence.getStartedAt());
        existing.setFinishedAt(occurrence.getFinishedAt());
        existing.setClosed(occurrence.isClosed());

        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Ocorrência não encontrada.");
        }

        repository.deleteById(id);
    }
}