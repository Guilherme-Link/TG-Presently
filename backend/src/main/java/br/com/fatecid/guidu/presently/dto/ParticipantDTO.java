package br.com.fatecid.guidu.presently.dto;

public class ParticipantDTO {

    private Long id;
    private String name;
    private Long userId;

    public ParticipantDTO() {
    }

    public ParticipantDTO(Long id, String name, Long userId) {
        this.id = id;
        this.name = name;
        this.userId = userId;
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
}