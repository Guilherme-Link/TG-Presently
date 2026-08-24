package br.com.fatecid.guidu.presently.dto;

import java.util.Set;

import br.com.fatecid.guidu.presently.entity.User;

public class UserResponse {

    private Long id;
    private String username;
    private Long participantId;
    private Set<String> roles;

    public UserResponse(Long id, String username, Long participantId, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.participantId = participantId;
        this.roles = roles;
    }

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.roles = user.getRoles();

        if (user.getParticipant() != null){
            this.participantId = user.getParticipant().getId();
        }
        else this.participantId = null;
    }

    // Getters (Não precisa de set, só do construtor)
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public Set<String> getRoles() {
        return roles;
    }

}