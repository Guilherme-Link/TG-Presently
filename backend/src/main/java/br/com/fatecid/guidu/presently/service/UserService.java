package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.EventDTO;
import br.com.fatecid.guidu.presently.dto.RegisterUserRequest;
import br.com.fatecid.guidu.presently.dto.UserLoginDTO;
import br.com.fatecid.guidu.presently.dto.UserResponse;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.User;
import br.com.fatecid.guidu.presently.repository.UserRepository;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repository,
                       PasswordEncoder encoder) {
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
    public User register(RegisterUserRequest request) {

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

        return repository.save(user);
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
        repository.deleteById(id);
    }
}
