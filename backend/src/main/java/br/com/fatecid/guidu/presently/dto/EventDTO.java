package br.com.fatecid.guidu.presently.dto;

import br.com.fatecid.guidu.presently.entity.Event;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

// DTO usado somente para respostas ao usuário
// Omite os objetos de usuário responsável, participante e ambiente, retornando somente os IDs

public class EventDTO {

    private Long id;

    private String name;

    private String description;

    private LocalTime startTime;

    private LocalTime endTime;

    private Event.EventType eventType;

    private Long responsibleUserId;

    private Long ambientId;

    private Set<Long> participantIds = new HashSet<>();

    public EventDTO() {
    }

    public EventDTO(Event event) {

        this.id = event.getId();
        this.name = event.getName();
        this.description = event.getDescription();
        this.startTime = event.getStartTime();
        this.endTime = event.getEndTime();
        this.eventType = event.getEventType();

        if (event.getResponsibleUser() != null) {
            this.responsibleUserId = event.getResponsibleUser().getId();
        }

        if (event.getAmbient() != null) {
            this.ambientId = event.getAmbient().getId();
        }

        event.getParticipants().forEach(user ->
                participantIds.add(user.getId())
        );
    }

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

    public Event.EventType getEventType() {
        return eventType;
    }

    public void setEventType(Event.EventType eventType) {
        this.eventType = eventType;
    }

    public Long getResponsibleUserId() {
        return responsibleUserId;
    }

    public void setResponsibleUserId(Long responsibleUserId) {
        this.responsibleUserId = responsibleUserId;
    }

    public Long getAmbientId() {
        return ambientId;
    }

    public void setAmbientId(Long ambientId) {
        this.ambientId = ambientId;
    }

    public Set<Long> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(Set<Long> participantIds) {
        this.participantIds = participantIds;
    }
}