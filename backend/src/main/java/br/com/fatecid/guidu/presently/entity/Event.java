package br.com.fatecid.guidu.presently.entity;

import jakarta.persistence.*;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
public class Event {

    // Definições do tipo de evento
    public enum EventType {
        SINGLE,
        RECURRING
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 44)
    private String secretKey;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EventType eventType;

    // Define a cada quantos dias um evento se repete
    @Column(nullable = false)
    private int intervalDays;

    // Relacionamento para vincular o responsável pelo evento
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsible_user_id", nullable = false)
    private Participant responsible;

    // Relacionamento para vincular o ambiente onde esse evento ocorre
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ambient_id", nullable = false)
    private Ambient ambient;

    // Relacionamento para vincular a lista dos participantes do evento
    @ManyToMany
    @JoinTable(
    name = "event_participants",
    joinColumns = @JoinColumn(name = "event_id"),
    inverseJoinColumns = @JoinColumn(name = "participant_id")
    )
    private Set<Participant> participants = new HashSet<>();

    public Event() {
    }

    public Event(String name,
             String description,
             LocalDate startDate,
             LocalDate endDate,
             LocalTime startTime,
             LocalTime endTime,
             EventType eventType,
             int intervalDays,
             Participant responsible,
             Ambient ambient) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.eventType = eventType;
        this.intervalDays = intervalDays;
        this.responsible = responsible;
        this.ambient = ambient;
        this.generateSecretKey();
    }

    // Verifica se o evento está ativo em determinado momento
    public boolean isActive(LocalDateTime dateTime) {
        LocalDate date = dateTime.toLocalDate();
        LocalTime time = dateTime.toLocalTime();

        // Verifica se o dia está no intervalo
        if (date.isBefore(startDate) || date.isAfter(endDate)) {
            return false;
        }

        // Verifica se o horário está no intervalo
        if (time.isBefore(startTime) || time.isAfter(endTime)) {
            return false;
        }

        // Se for um evento único, está válido
        if (eventType == EventType.SINGLE) {
            return true;
        }

        // Se for um evento recorrente, é preciso verificar se o evento deveria ocorrer nessa data
        // Pega a diferença entre a data verificada e a data de início
        long days = ChronoUnit.DAYS.between(startDate, date);

        // Verifica se a quantidade de dias bate com o intervalo cadastrado
        return days % intervalDays == 0;
    }

    // Auxiliares para manipulação dos códigos de verificação (somente getter e geração de chave secreta)
    public String getSecretKey(){
        return secretKey;
    }

    public void generateSecretKey(){
        SecureRandom random = new SecureRandom();

        // Criando array de 32 bytes (256 bits) e atribuindo valor aleatório
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);

        // Fazendo a conversão para String em base64, 256 bits equivalem a 44 caracteres
        secretKey = Base64.getEncoder().encodeToString(bytes);
    }

    // Auxiliares para manipulação individual de participantes
    public void addParticipant(Participant participant) {
        this.participants.add(participant);
    }

    public void removeParticipant(Participant participant) {
        this.participants.remove(participant);
    }


    //Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public int getIntervalDays(){
        return intervalDays;
    }
    
    public void setIntervalDays(int intervalDays){
        this.intervalDays = intervalDays;
    }

    public Participant getResponsible() {
        return responsible;
    }

    public void setResponsible(Participant responsible) {
        this.responsible = responsible;
    }

    public Ambient getAmbient() {
        return ambient;
    }

    public void setAmbient(Ambient ambient) {
        this.ambient = ambient;
    }

    public Set<Participant> getParticipants() {
        return participants;
    }

    public void setParticipants(Set<Participant> participants) {
        this.participants = participants;
    }

}