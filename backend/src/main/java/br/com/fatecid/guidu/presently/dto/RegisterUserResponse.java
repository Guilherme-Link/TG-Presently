package br.com.fatecid.guidu.presently.dto;

import java.util.Set;

public class RegisterUserResponse {

    private final Long id;
    private final String username;
    private final Set<String> roles;
    private final String generatedPassword;

    public RegisterUserResponse(Long id, String username, Set<String> roles, String generatedPassword) {
        this.id = id;
        this.username = username;
        this.roles = roles;
        this.generatedPassword = generatedPassword;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public String getGeneratedPassword() {
        return generatedPassword;
    }
}
