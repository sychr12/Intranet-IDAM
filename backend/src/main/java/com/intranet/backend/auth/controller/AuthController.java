package com.intranet.backend.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.intranet.backend.auth.dto.LoginRequest;
import com.intranet.backend.auth.dto.LoginResponse;
import com.intranet.backend.auth.dto.RefreshTokenRequest;
import com.intranet.backend.auth.service.AuthService;
import com.intranet.backend.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest) {
        log.info("Requisição de login para: {}", loginRequest.getUsername());

        LoginResponse loginResponse = authService.login(loginRequest);

        return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso", loginResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        log.info("Requisição de refresh token");

        LoginResponse loginResponse = authService.refreshToken(request);

        return ResponseEntity.ok(
                ApiResponse.success("Token atualizado com sucesso", loginResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authorization) {
        log.info("Requisição de logout");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            authService.logout(token);
        }

        return ResponseEntity.ok(ApiResponse.success("Logout realizado com sucesso"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfo>> getCurrentUser() {
        log.info("Requisição para obter dados do usuário atual");

        var user = authService.getCurrentUser();

        LoginResponse.UserInfo userInfo =
                LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .nome(user.getNome())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .foto(user.getFoto())
                        .ativo(user.getAtivo())
                        .build();

        return ResponseEntity.ok(
                ApiResponse.success("Dados do usuário obtidos com sucesso", userInfo));
    }
}
