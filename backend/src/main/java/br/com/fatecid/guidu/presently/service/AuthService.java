package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.UserLoginDTO;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.entity.User;
import br.com.fatecid.guidu.presently.repository.UserRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository repository;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthService(AuthenticationManager authenticationManager,
                        UserRepository repository) {
        this.authenticationManager = authenticationManager;
        this.repository = repository;
    }

    public UserResponse login(UserLoginDTO loginDTO, HttpServletRequest request,
                               HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(),
                        loginDTO.getPassword()
                )
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        User user = repository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(loginDTO.getUsername()));

        return new UserResponse(user);
    }

    public UserResponse getCurrentUser(Authentication authentication) {

    // Authentication.getName() retorna o username do usuário logado na sessão
    User user = repository.findByUsername(authentication.getName())
            .orElseThrow(() -> new UsernameNotFoundException(authentication.getName()));

    return new UserResponse(user);
}

}