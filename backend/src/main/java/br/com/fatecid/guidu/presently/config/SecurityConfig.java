package br.com.fatecid.guidu.presently.config;

import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Login é a única rota totalmente pública
                .requestMatchers(HttpMethod.POST, "/security/v1/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/security/v1/me").authenticated()

                // Cadastro de usuário só pode ser feito por admin
                .requestMatchers(HttpMethod.POST, "/security/v1/register").hasRole("ADMIN")

                // Listagem e remoção de usuários são exclusivas de admin
                .requestMatchers(HttpMethod.GET, "/security/v1/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/security/v1/{id}").hasRole("ADMIN")

                // Qualquer outra rota dentro de /security/** também exige admin
                .requestMatchers("/security/**").hasRole("ADMIN")

                // Todo o restante da aplicação só exige autenticação
                .anyRequest().authenticated());

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
        "http://localhost:*",
        "https://localhost:*",
        "https://192.168.*.*:*",   // rede local (Wi-Fi doméstica/roteador comum)
        "https://10.*.*.*:*"       // outra faixa comum de rede local/corporativa
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // essencial pra cookie de sessão

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
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

    // Também cria o usuário service/service, caso não exista
    // A classe de serviço é usada para conexão dos terminais físicos.
    // Assim como admin, a senha deve ser alterada após a criação, e definida na configuração dos terminais 
    @Bean
    CommandLineRunner init(UserRepository repository,
                       PasswordEncoder encoder) {

    return args -> {

        if (!repository.existsByUsername("admin")) {

            User admin = new User();

            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin"));
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_RESPONSIBLE", "ROLE_USER"));

            repository.save(admin);
        }

        if (!repository.existsByUsername("service")) {

            User service = new User();

            service.setUsername("service");
            service.setPassword(encoder.encode("service"));
            service.setRoles(Set.of("ROLE_ADMIN", "ROLE_RESPONSIBLE", "ROLE_USER"));

            repository.save(service);
        }

    };
}
}
