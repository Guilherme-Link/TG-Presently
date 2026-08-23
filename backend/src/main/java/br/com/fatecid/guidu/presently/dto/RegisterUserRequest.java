package br.com.fatecid.guidu.presently.dto;

public class RegisterUserRequest {

    private String username;
    private String fullName;
    private String password;
    private String role;

    // Getters e Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

     public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}