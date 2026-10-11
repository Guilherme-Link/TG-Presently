package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.RegisterUserRequest;
import br.com.fatecid.guidu.presently.dto.UpdateUserRequest;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.entity.User;
import br.com.fatecid.guidu.presently.repository.ParticipantRepository;
import br.com.fatecid.guidu.presently.repository.UserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository repository;
    private final ParticipantService participantService;
    private final ParticipantRepository participantRepository;
    private final PasswordEncoder encoder;

    public UserService(
                UserRepository repository,
                ParticipantService participantService,
                ParticipantRepository participantRepository,
                PasswordEncoder encoder
            ) {
        this.repository = repository;
        this.participantService = participantService;
        this.participantRepository = participantRepository;
        this.encoder = encoder;
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


    // Cria um novo usuário
    @Transactional
    public UserResponse register(RegisterUserRequest request) {

        // Erro de usuário já existente
        if (repository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Nome de usuário já está em uso");
        }

        // Cria o usuário em branco e o participante correspondente
        User user = new User();
        Participant participant;

        if (request.isLinkedExistingParticipant()) {
            // Se for criar um link com participante existente, verifica se ele é válido e faz a atribuição
            participant = participantService.findInactiveById(request.getParticipantId());
        }
        else {
            // Se for um novo participante, cria e parametriza o objeto
            participant = new Participant();
            participant.setName(request.getFullName());
            participantRepository.save(participant);
        }

        // Salva o nome do usuário e o hash codificado da senha
        user.setUsername(request.getUsername());
        user.setPassword(
            encoder.encode(request.getPassword())
        );

        // Vincula o usuário ao participant
            participant.setUser(user);
            user.setParticipant(participant);

        // Atribui os roles de acordo com o request
        resolveRoles(user, request.getRole());

        // salva o user
        repository.save(user);

        return new UserResponse(user);
    }

    // Retorna uma lista de todos os usuários
    public List<User> findAll() {
        return repository.findAll();
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        String username = request.getUsername().trim();
        if (!username.equals(user.getUsername()) && repository.existsByUsername(username)) {
            throw new IllegalArgumentException("Nome de usuário já está em uso");
        }

        user.setUsername(username);
        resolveRoles(user, request.getRole());

        return new UserResponse(repository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Participant participant = user.getParticipant();

        if (participant != null) {
            participant.setUser(null);
            user.setParticipant(null);
        }

        repository.delete(user);
    }

    public void resolveRoles(User user, String role){
        if (role.equals("user")) {
            // Define o usuário somente como user
            user.setRoles(Set.of("ROLE_USER"));
            if (user.getParticipant() != null) {
                user.getParticipant().setCanBeResponsible(false);
            }
        }
        else if (role.equals("responsible")){
            // Dá privilégios de responsável por evento
            user.setRoles(Set.of("ROLE_RESPONSIBLE", "ROLE_USER"));
            if (user.getParticipant() != null) {
                user.getParticipant().setCanBeResponsible(true);
            }
        }
        else if (role.equals("admin")){
            // Dá privilégios de admin
            user.setRoles(Set.of("ROLE_ADMIN", "ROLE_RESPONSIBLE", "ROLE_USER"));
            if (user.getParticipant() != null) {
                user.getParticipant().setCanBeResponsible(true);
            }
        }
        else {
            // Erro de role inválido
            throw new IllegalArgumentException("Role inválido! O novo usuário deve possuir nível user, responsible ou admin");
        }
    }

}
