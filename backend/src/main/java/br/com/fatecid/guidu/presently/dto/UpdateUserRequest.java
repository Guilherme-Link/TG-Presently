package br.com.fatecid.guidu.presently.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateUserRequest {

    @NotBlank
    @Email
    @JsonAlias("username")
    private String email;

    @NotBlank
    private String role;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
