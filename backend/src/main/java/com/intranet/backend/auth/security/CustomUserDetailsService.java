package com.intranet.backend.auth.security;

import com.intranet.backend.user.model.User;
import com.intranet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Carregando usuario por username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("Usuario nao encontrado com username: {}", username);
                    return new UsernameNotFoundException("Usuario nao encontrado: " + username);
                });

        return toUserDetails(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(String id) {
        log.debug("Carregando usuario por ID: {}", id);

        User user = userRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> {
                    log.error("Usuario nao encontrado com ID: {}", id);
                    return new UsernameNotFoundException("Usuario nao encontrado com ID: " + id);
                });

        return toUserDetails(user);
    }

    private UserDetails toUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .disabled(!Boolean.TRUE.equals(user.getAtivo()))
                .build();
    }
}
