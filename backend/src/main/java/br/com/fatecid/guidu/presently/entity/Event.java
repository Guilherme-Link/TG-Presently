package br.com.fatecid.guidu.presently.entity;

import jakarta.persistence.*;

import java.security.SecureRandom;
import java.time.LocalTime;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
public class Event {

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
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EventType eventType;

    // Relacionamento para vincular o responsável pelo evento
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsible_user_id", nullable = false)
    private User responsibleUser;

    // Relacionamento para vincular o ambiente onde esse evento ocorre
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ambient_id", nullable = false)
    private Ambient ambient;

    // Relacionamento para vincular a lista dos participantes do evento
    @ManyToMany
    @JoinTable(
    name = "event_participants",
    joinColumns = @JoinColumn(name = "event_id"),
    inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> participants = new HashSet<>();

    public Event() {
    }

    public Event(String name,
             String description,
             LocalTime startTime,
             LocalTime endTime,
             EventType eventType,
             User responsibleUser,
             Ambient ambient) {
        this.name = name;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.eventType = eventType;
        this.responsibleUser = responsibleUser;
        this.ambient = ambient;
        this.generateSecretKey();
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
    public void addParticipant(User user) {
        this.participants.add(user);
    }

    public void removeParticipant(User user) {
        this.participants.remove(user);
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

    public User getResponsibleUser() {
        return responsibleUser;
    }

    public void setResponsibleUser(User responsibleUser) {
        this.responsibleUser = responsibleUser;
    }

    public Ambient getAmbient() {
        return ambient;
    }

    public void setAmbient(Ambient ambient) {
        this.ambient = ambient;
    }

    public Set<User> getParticipants() {
        return participants;
    }

    public void setParticipants(Set<User> participants) {
        this.participants = participants;
    }

}