package br.com.fatecid.guidu.presently.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(
    name = "attendance_records",
    // Constraint para não permitir dois registros de presença para o mesmo usuário na mesma ocorrência
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"occurrence_id", "participant_id"}
    )
)
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "occurrence_id")
    private EventOccurrence occurrence;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id")
    private Participant participant;

    @Column(nullable = false)
    private boolean present;

    @Column
    private LocalDateTime checkInTime;

    public AttendanceRecord() {
    }

    public AttendanceRecord(Long id, EventOccurrence occurrence, Participant participant,
                            boolean present, LocalDateTime checkInTime) {
        this.id = id;
        this.occurrence = occurrence;
        this.participant = participant;
        this.present = present;
        this.checkInTime = checkInTime;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EventOccurrence getOccurrence() {
        return occurrence;
    }

    public void setOccurrence(EventOccurrence occurrence) {
        this.occurrence = occurrence;
    }

    public Participant getParticipant() {
        return participant;
    }

    public void setParticipant(Participant participant) {
        this.participant = participant;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }
}