package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.UserLoginDTO;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/security/v1")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody UserLoginDTO loginDTO,
                                               HttpServletRequest request,
                                               HttpServletResponse response) {
        UserResponse userResponse = authService.login(loginDTO, request, response);
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        UserResponse userResponse = authService.getCurrentUser(authentication);
        return ResponseEntity.ok(userResponse);
    }
}
