package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.UserLoginDTO;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.dto.UpdateProfileRequest;
import br.com.fatecid.guidu.presently.entity.User;
import br.com.fatecid.guidu.presently.repository.UserRepository;
import br.com.fatecid.guidu.presently.config.MfaSessionFilter;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.webauthn.api.PublicKeyCredentialUserEntity;
import org.springframework.security.web.webauthn.management.PublicKeyCredentialUserEntityRepository;
import org.springframework.security.web.webauthn.management.UserCredentialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository repository;
    private final PublicKeyCredentialUserEntityRepository credentialUserRepository;
    private final UserCredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthService(AuthenticationManager authenticationManager,
                        UserRepository repository,
                        PublicKeyCredentialUserEntityRepository credentialUserRepository,
                        UserCredentialRepository credentialRepository,
                        PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.repository = repository;
        this.credentialUserRepository = credentialUserRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResult login(UserLoginDTO loginDTO, HttpServletRequest request,
                               HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(),
                        loginDTO.getPassword()
                )
        );

        User user = repository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(loginDTO.getUsername()));

        PublicKeyCredentialUserEntity credentialUser =
                credentialUserRepository.findByUsername(user.getUsername());
        boolean mfaRequired = credentialUser != null
                && !credentialRepository.findByUserId(credentialUser.getId()).isEmpty();

        if (mfaRequired) {
            request.getSession(true).setAttribute(MfaSessionFilter.PENDING_USERNAME, user.getUsername());
        } else if (request.getSession(false) != null) {
            request.getSession(false).removeAttribute(MfaSessionFilter.PENDING_USERNAME);
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        return new LoginResult(new UserResponse(user), mfaRequired);
    }

    public void cancelPendingLogin(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    public record LoginResult(UserResponse user, boolean mfaRequired) {}

    public UserResponse getCurrentUser(Authentication authentication) {

    // Authentication.getName() retorna o username do usuário logado na sessão
    User user = repository.findByUsername(authentication.getName())
            .orElseThrow(() -> new UsernameNotFoundException(authentication.getName()));

    return new UserResponse(user);
}

    @Transactional
    public UserResponse updateProfile(Authentication authentication, UpdateProfileRequest request) {
        User user = repository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException(authentication.getName()));

        String newPassword = request.getNewPassword() == null ? "" : request.getNewPassword();
        if (!newPassword.isBlank()) {
            String currentPassword = request.getCurrentPassword();
            if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new IllegalArgumentException("A senha atual está incorreta.");
            }
            if (newPassword.length() < 8) {
                throw new IllegalArgumentException("A nova senha deve ter pelo menos 8 caracteres.");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        return new UserResponse(repository.save(user));
    }

}
