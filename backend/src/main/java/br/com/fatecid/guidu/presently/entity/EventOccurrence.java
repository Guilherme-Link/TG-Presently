package br.com.fatecid.guidu.presently.entity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(
    name = "event_occurrences",
    // Constraint para não permitir abrir duas ocorrências do mesmo evento na mesma data
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"event_id", "event_date"}
    )
)
public class EventOccurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Indica de qual evento essa ocorrência é uma instância
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false)
    private LocalTime startedAt;

    @Column(nullable = false)
    private LocalTime finishedAt;

    @Column(nullable = false)
    private boolean closed;

    @OneToMany(
        mappedBy = "occurrence",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<AttendanceRecord> attendanceRecords = new ArrayList<>();

    public EventOccurrence() {
    }

    public EventOccurrence(Long id, Event event, LocalDate eventDate,
                        LocalTime startedAt, LocalTime finishedAt,
                        boolean closed) {
        this.id = id;
        this.event = event;
        this.eventDate = eventDate;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
        this.closed = closed;
    }

    // Auxiliares para manipular registros de presença individuais
    public void addAttendanceRecord(AttendanceRecord attendanceRecord) {
        attendanceRecords.add(attendanceRecord);
        attendanceRecord.setOccurrence(this);
    }

    public void removeAttendanceRecord(AttendanceRecord attendanceRecord) {
        attendanceRecords.remove(attendanceRecord);
        attendanceRecord.setOccurrence(null);
    }

    // Getter e setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public boolean isClosed() {
        return closed;
    }

    public void setClosed(boolean closed) {
        this.closed = closed;
    }

    public List<AttendanceRecord> getAttendanceRecords() {
        return attendanceRecords;
    }

    public void setAttendanceRecords(List<AttendanceRecord> attendanceRecords) {
        this.attendanceRecords = attendanceRecords;
    }
}

