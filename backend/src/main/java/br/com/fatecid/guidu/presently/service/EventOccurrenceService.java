package br.com.fatecid.guidu.presently.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

import br.com.fatecid.guidu.presently.entity.AttendanceRecord;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.EventOccurrence;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.repository.AttendanceRecordRepository;
import br.com.fatecid.guidu.presently.repository.EventOccurrenceRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class EventOccurrenceService {

    private final EventOccurrenceRepository repository;
    private final AttendanceRecordRepository recordRepository;

    public EventOccurrenceService(EventOccurrenceRepository repository, AttendanceRecordRepository recordRepository) {
        this.repository = repository;
        this.recordRepository = recordRepository;
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

    public EventOccurrence findByEventIdAndDate(Long id, LocalDate date) {
        EventOccurrence occurrence = repository.findByEventIdAndEventDate(id, date)
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
        for (Participant participant : event.getParticipants()) {

            AttendanceRecord record = new AttendanceRecord();

            record.setParticipant(participant);
            record.setPresent(false);

            occurrence.addAttendanceRecord(record);
        }

        return repository.save(occurrence);
    }

    public EventOccurrence getOrCreateOccurrence(Event event, LocalDate eventDate){
        EventOccurrence occurrence;

        // Verifica se já existe uma instância para o evento em questão
        try{
            // Caso já exista, usa a existente
            occurrence = findByEventIdAndDate(event.getId(),eventDate);
        }
        catch(EntityNotFoundException e){
            // Cria uma nova ocorrência a partir do evento que está sendo validado
            occurrence = createFromEvent(event,eventDate);
        }

        return occurrence;
    }

    // Abre uma ocorrência de evento (Exemplo: Evento começou antes do horário)
    public void openOccurrenceById(long id){
        EventOccurrence occurrence = findById(id);
        occurrence.setClosed(false);
    }

    // Abre uma ocorrência de evento (Exemplo: Evento foi instanciado antes do horário, mas ainda não abriu)
    public void closeOccurrenceById(long id){
        EventOccurrence occurrence = findById(id);
        occurrence.setClosed(true);
    }

    // Valida a presença de um participante em uma instância da ocorrência pelo ID de participante
    public void registerPresence(long OccurrenceId, long participantId, LocalDateTime checkInTime){
        AttendanceRecord record = recordRepository.findByOccurrenceIdAndParticipantId(OccurrenceId, participantId)
            .orElseThrow(() -> 
                new EntityNotFoundException("Usuário não participa deste evento."));

        record.setPresent(true);
        record.setCheckInTime(checkInTime);
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