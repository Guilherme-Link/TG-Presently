package br.com.fatecid.guidu.presently.dto;

import br.com.fatecid.guidu.presently.entity.Event;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

// DTO usado somente para respostas ao usuário
// Omite os objetos de usuário responsável, participante e ambiente, retornando somente os IDs

public class EventDTO {

    private Long id;

    private String name;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Event.EventType eventType;

    private int intervalDays;

    private Long responsibleId;

    private Long ambientId;

    private Set<Long> participantIds = new HashSet<>();

    public EventDTO() {
    }

    public EventDTO(Event event) {

        this.id = event.getId();
        this.name = event.getName();
        this.description = event.getDescription();
        this.startDate = event.getStartDate();
        this.endDate = event.getEndDate();
        this.startTime = event.getStartTime();
        this.endTime = event.getEndTime();
        this.eventType = event.getEventType();
        this.intervalDays = event.getIntervalDays();
        this.responsible = event.getResponsible();

        if (event.getResponsible() != null) {
            this.responsibleId = event.getResponsible().getId();
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

    public Event.EventType getEventType() {
        return eventType;
    }

    public void setEventType(Event.EventType eventType) {
        this.eventType = eventType;
    }

    public int getIntervalDays(){
        return intervalDays;
    }
    
    public void setIntervalDays(int intervalDays){
        this.intervalDays = intervalDays;
    }

    public Long getResponsibleId() {
        return responsibleId;
    }

    public void setResponsibleId(Long responsibleId) {
        this.responsibleId = responsibleId;
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
