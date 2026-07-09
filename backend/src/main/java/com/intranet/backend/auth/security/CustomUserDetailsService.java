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
        log.debug("Carregando usuário por username: {}", username);

        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("Usuário não encontrado com username: {}", username);
                    return new UsernameNotFoundException("Usuário não encontrado: " + username);
                });
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(String id) {
        log.debug("Carregando usuário por ID: {}", id);

        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Usuário não encontrado com ID: {}", id);
                    return new UsernameNotFoundException("Usuário não encontrado com ID: " + id);
                });
    }
}