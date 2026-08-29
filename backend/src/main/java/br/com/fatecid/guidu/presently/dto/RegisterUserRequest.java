package br.com.fatecid.guidu.presently.dto;

import jakarta.validation.constraints.NotBlank;

public class RegisterUserRequest {

    @NotBlank
    private String username;
    
    @NotBlank
    private String fullName;
    
    @NotBlank
    private String password;

    @NotBlank
    private String role;

    private boolean linkExistingParticipant;
    
    private Long participantId;

    // Getters
    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public boolean isLinkedExistingParticipant() {
        return linkExistingParticipant;
    }

    public void setLinkExistingParticipant(boolean linkExistingParticipant) { 
        this.linkExistingParticipant = linkExistingParticipant; 
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) { 
        this.participantId = participantId; 
    }
}
