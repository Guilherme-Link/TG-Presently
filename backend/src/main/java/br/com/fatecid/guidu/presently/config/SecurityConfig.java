package br.com.fatecid.guidu.presently.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import br.com.fatecid.guidu.presently.entity.User;
import br.com.fatecid.guidu.presently.repository.UserRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    //Configuração das rotas e permissões da aplicação
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Limita as rotas de security apenas para usuários admin
                .requestMatchers("/security/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    // Configurações de autenticação
    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {
        return configuration.getAuthenticationManager();
    }

    // Cria um usuário admin/admin, caso não exista um usuário admin na aplicação
    // É o usuário do first setup da aplicação. Depois da instalação a senha deve ser alterada
    @Bean
    CommandLineRunner init(UserRepository repository,
                       PasswordEncoder encoder) {

    return args -> {

        if (!repository.existsByUsername("admin")) {

            User admin = new User();

            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin"));
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));

            repository.save(admin);
        }

    };
}
}