package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.dto.UserLoginDTO;
import br.com.fatecid.guidu.presently.dto.UpdateProfileRequest;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.web.csrf.CsrfToken;
import java.util.Map;
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
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDTO loginDTO,
                                               HttpServletRequest request,
                                               HttpServletResponse response) {
        AuthService.LoginResult result = authService.login(loginDTO, request, response);
        if (result.mfaRequired()) {
            return ResponseEntity.accepted().body(Map.of(
                    "mfaRequired", true,
                    "user", result.user()
            ));
        }
        return ResponseEntity.ok(result.user());
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @PostMapping("/mfa/cancel")
    public ResponseEntity<Void> cancelPendingLogin(HttpServletRequest request) {
        authService.cancelPendingLogin(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        UserResponse userResponse = authService.getCurrentUser(authentication);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/me/profile")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        try {
            return ResponseEntity.ok(authService.updateProfile(authentication, request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }
}
