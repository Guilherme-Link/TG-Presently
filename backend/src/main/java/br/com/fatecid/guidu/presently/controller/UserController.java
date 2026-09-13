package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.RegisterUserRequest;
import br.com.fatecid.guidu.presently.dto.UpdateUserRequest;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/security/v1")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // Criação de novos usuários
    @PostMapping("/register")
    public UserResponse register(
            @Valid @RequestBody RegisterUserRequest request) {

        try{
            return service.register(request);
        }
        catch(IllegalArgumentException e){
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, e.getMessage());
        }
    }

    // Lista todos os usuários existentes
    @GetMapping("/users")
    public List<UserResponse> all() {

        return service.findAll()
                .stream()
                .map(u -> new UserResponse(u))
                .toList();
    }


    // Deleta um usuário pelo ID
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void delete(@PathVariable Long id) {
        try {
            service.delete(id);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Edita um usuário pelo ID
    @PutMapping("/{id}")
    public UserResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        try {
            return service.update(id, request);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, e.getMessage());
        }
    }
}
