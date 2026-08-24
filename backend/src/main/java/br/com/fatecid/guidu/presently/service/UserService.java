package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.RegisterUserRequest;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.entity.User;
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
    private final PasswordEncoder encoder;

    public UserService(
                UserRepository repository,
                PasswordEncoder encoder
            ) {
        this.repository = repository;
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

        User user = new User();

        // Salva o nome do usuário e o hash codificado da senha
        user.setUsername(request.getUsername());
        user.setPassword(
                encoder.encode(request.getPassword())
        );

        // Recebe os roles solicitados para o novo usuário
        String role = request.getRole();
       
        if (role.equals("user")) {
            // Define o usuário somente como user
            user.setRoles(Set.of("ROLE_USER"));
        }
        else if (role.equals("admin")){
            // Dá privilégios de admin
            user.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));
        }
        else {
            // Erro de role inválido
            throw new IllegalArgumentException("Role inválido! O novo usuário deve possuir nível user ou admin");
        }

        // Criando o participante correspondente ao novo usuário criado
        Participant participant = new Participant();
        participant.setName(request.getFullName());

        // Vincula o usuário ao participant
        participant.setUser(user);
        user.setParticipant(participant);

        // salva o user, e o hibernate cuida da persistência do participant correspondente
        repository.save(user);

        return new UserResponse(user);
    }

    // Retorna uma lista de todos os usuários
    public List<User> findAll() {
        return repository.findAll();
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
}