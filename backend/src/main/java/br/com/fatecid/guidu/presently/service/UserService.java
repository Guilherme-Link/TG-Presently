package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.dto.RegisterUserRequest;
import br.com.fatecid.guidu.presently.dto.RegisterUserResponse;
import br.com.fatecid.guidu.presently.dto.UpdateUserRequest;
import br.com.fatecid.guidu.presently.dto.UpdateUserResponse;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.User;
import br.com.fatecid.guidu.presently.repository.UserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;
    private final PasswordGeneratorService passwordGeneratorService;

    public UserService(UserRepository repository,
                       PasswordEncoder encoder,
                       PasswordGeneratorService passwordGeneratorService) {
        this.repository = repository;
        this.encoder = encoder;
        this.passwordGeneratorService = passwordGeneratorService;
    }

    // Retorna um objeto de detalhes de um usuário; 
    // Precisa do override porque é um método que existe na UserDetailsService do próprio spring security
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = repository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles()
                        .stream()
                        .map(SimpleGrantedAuthority::new)
                        .toList()
        );
    }


    // Cria um novo usuário com senha temporária gerada no backend
    @Transactional
    public RegisterUserResponse register(RegisterUserRequest request) {
        String email = normalizeEmail(request.getEmail());

        // Erro de usuário já existente
        if (repository.existsByUsername(email)) {
            throw new IllegalArgumentException("Email já está em uso");
        }

        User user = new User();
        String rawPassword = normalizePassword(request.getPassword());
        boolean passwordWasGenerated = false;

        if (rawPassword == null) {
            rawPassword = passwordGeneratorService.generate();
            passwordWasGenerated = true;
        }

        // Salva o e-mail do usuário e a senha codificada
        user.setUsername(email);
        user.setPassword(encoder.encode(rawPassword));

        // Recebe os roles solicitados para o novo usuário
        user.setRoles(resolveRoles(request.getRole()));

        User savedUser = repository.save(user);

        return new RegisterUserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRoles(),
                passwordWasGenerated ? rawPassword : null
        );
    }

    @Transactional
    public UpdateUserResponse update(Long id, UpdateUserRequest request) {
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        String email = normalizeEmail(request.getEmail());

        if (repository.existsByUsername(email) && !email.equals(user.getUsername())) {
            throw new IllegalArgumentException("Email já está em uso");
        }

        user.setUsername(email);
        user.setRoles(resolveRoles(request.getRole()));

        User savedUser = repository.save(user);

        return new UpdateUserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRoles()
        );
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private Set<String> resolveRoles(String role) {
        if (role == null) {
            throw new IllegalArgumentException("Tipo de usuário inválido. Use Aluno ou Administrador.");
        }

        String normalizedRole = role.trim().toLowerCase(Locale.ROOT);

        if (normalizedRole.equals("aluno") || normalizedRole.equals("user") || normalizedRole.equals("role_user")) {
            return new HashSet<>(Set.of("ROLE_USER"));
        }

        if (
                normalizedRole.equals("administrador") ||
                normalizedRole.equals("admin") ||
                normalizedRole.equals("role_admin")
        ) {
            return new HashSet<>(Set.of("ROLE_ADMIN", "ROLE_USER"));
        }

        throw new IllegalArgumentException("Tipo de usuário inválido. Use Aluno ou Administrador.");
    }

    private String normalizePassword(String password) {
        if (password == null) {
            return null;
        }

        String normalized = password.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    // Retorna uma lista de todos os usuários
    public List<User> findAll() {
        return repository.findAll();
    }

    // Retorna uma lista dos eventos pelos quais o usuário é reponsável
    @Transactional(readOnly = true)
    public List<EventDTO> getResponsibleEvents(Long userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        //Precisa da conversão de eventos para EventDTO para evitar referência circular na resposta
        List<EventDTO> lista = new ArrayList<>();
        for (Event event : user.getResponsibleEvents()) {
            lista.add(new EventDTO(event));
        }

        return lista;
    }

    // Retorna uma lista dos eventos dos quais o usuário é participante
    @Transactional(readOnly = true)
    public List<EventDTO> getParticipatingEvents(Long userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));


        //Precisa da conversão de eventos para EventDTO para evitar referência circular na resposta
        List<EventDTO> lista = new ArrayList<>();
        for (Event event : user.getParticipatingEvents()) {
            lista.add(new EventDTO(event));
        }

        return lista;
    }

    // Deleta um usuário específico
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Usuário não encontrado");
        }

        repository.deleteById(id);
    }
}
