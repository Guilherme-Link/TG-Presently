package br.com.fatecid.guidu.presently.dto;

import java.util.Set;

public class UserResponse {

    private Long id;
    private String username;
    private Set<String> roles;

    public UserResponse(Long id, String username, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.roles = roles;
    }

    // Getters (Não precisa de set, só do construtor)
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