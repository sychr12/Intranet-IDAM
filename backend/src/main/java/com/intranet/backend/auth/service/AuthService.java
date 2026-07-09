package com.intranet.backend.auth.service;

import com.intranet.backend.auth.dto.LoginRequest;
import com.intranet.backend.auth.dto.LoginResponse;
import com.intranet.backend.auth.dto.RefreshTokenRequest;
import com.intranet.backend.auth.security.CustomUserDetailsService;
import com.intranet.backend.common.exception.BusinessException;
import com.intranet.backend.user.model.User;
import com.intranet.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Tentativa de login para usuário: {}", loginRequest.getUsername());

        try {
            // Autenticar usuário
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Carregar usuário
            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

            // Verificar se usuário está ativo
            if (!user.getAtivo()) {
                log.warn("Tentativa de login de usuário inativo: {}", loginRequest.getUsername());
                throw new BusinessException("Usuário inativo. Entre em contato com o administrador.");
            }

            // Gerar tokens
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            log.info("Login bem-sucedido para: {}", loginRequest.getUsername());

            // Construir resposta
            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtService.extractExpiration(accessToken).getTime())
                    .user(LoginResponse.UserInfo.builder()
                            .id(user.getId())
                            .nome(user.getNome())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .role(user.getRole().name())
                            .foto(user.getFoto())
                            .ativo(user.getAtivo())
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("Erro durante login: {}", e.getMessage());
            throw new BusinessException("Credenciais inválidas: " + e.getMessage());
        }
    }

    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        log.info("Solicitando refresh token");

        String refreshToken = request.getRefreshToken();

        // Validar refresh token
        if (!jwtService.validateToken(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            log.error("Refresh token inválido");
            throw new BusinessException("Refresh token inválido");
        }

        // Extrair username do token
        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // Gerar novo access token
        String newAccessToken = jwtService.generateToken(userDetails);

        // Buscar usuário para informações
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        log.info("Refresh token gerado com sucesso para: {}", username);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Manter o mesmo refresh token
                .tokenType("Bearer")
                .expiresIn(jwtService.extractExpiration(newAccessToken).getTime())
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .nome(user.getNome())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .foto(user.getFoto())
                        .ativo(user.getAtivo())
                        .build())
                .build();
    }

    public void logout(String token) {
        log.info("Logout realizado");
        // Aqui você pode implementar blacklist de tokens se necessário
        // Por enquanto, apenas limpamos o contexto de segurança
        SecurityContextHolder.clearContext();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Usuário não autenticado");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
    }
}