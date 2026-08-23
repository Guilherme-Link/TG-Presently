package br.com.fatecid.guidu.presently.dto;

public class ParticipantDTO {

    private Long id;
    private String name;

    public ParticipantDTO() {
    }

    public ParticipantDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}