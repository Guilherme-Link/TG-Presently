package br.com.fatecid.guidu.presently.dto;

import java.util.Set;

public class UpdateUserResponse {

    private final Long id;
    private final String username;
    private final Set<String> roles;

    public UpdateUserResponse(Long id, String username, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.roles = roles;
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
}
