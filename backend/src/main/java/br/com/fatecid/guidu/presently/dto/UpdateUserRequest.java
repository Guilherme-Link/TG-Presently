package br.com.fatecid.guidu.presently.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateUserRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String role;

    public String getUsername() {
        return username;
    }

    public void setEmail(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
