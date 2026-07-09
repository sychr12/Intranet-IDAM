package com.intranet.backend.config;

import com.intranet.backend.user.model.Role;
import com.intranet.backend.user.model.User;
import com.intranet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (repository.count() == 0) {

            User admin = User.builder()
                    .nome("Administrador")
                    .username("admin")
                    .senha(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .ativo(true)
                    .build();

            repository.save(admin);

            System.out.println("==================================");
            System.out.println("Administrador criado com sucesso!");
            System.out.println("Usuário: admin");
            System.out.println("Senha: admin123");
            System.out.println("==================================");
        }

    }

}