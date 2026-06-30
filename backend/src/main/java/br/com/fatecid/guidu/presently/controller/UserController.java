package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.RegisterUserRequest;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.entity.User;
import br.com.fatecid.guidu.presently.service.UserService;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody RegisterUserRequest request) {

        User user = service.register(request);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRoles()
        );
    }

    // Lista todos os usuários existentes
    @GetMapping("/users")
    public List<UserResponse> all() {

        return service.findAll()
                .stream()
                .map(u -> new UserResponse(
                        u.getId(),
                        u.getUsername(),
                        u.getRoles()))
                .toList();
    }


    // Deleta um usuário pelo ID
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }


    // TODO (Gui): criar um método para editar um perfil usuário / adicionar biometria
}
