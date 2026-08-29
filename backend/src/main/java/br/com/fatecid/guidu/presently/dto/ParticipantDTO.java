package br.com.fatecid.guidu.presently.dto;

import br.com.fatecid.guidu.presently.entity.Participant;

public class ParticipantDTO {

    private Long id;
    private String name;
    private Long userId;
    private boolean canBeResponsible;

    public ParticipantDTO() {
    }

    public ParticipantDTO(Participant participant) {
        this.id = participant.getId();
        this.name = participant.getName();
        this.canBeResponsible = participant.isCanBeResponsible();

        if (participant.getUser() == null) this.userId = null;
        else this.userId = participant.getUser().getId();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Long getUserId() {
        return userId;
    }

    public boolean isCanBeResponsible(){
        return canBeResponsible;
    }
}