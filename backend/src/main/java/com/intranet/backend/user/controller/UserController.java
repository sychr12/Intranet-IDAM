package com.intranet.backend.user.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.intranet.backend.common.dto.ApiResponse;
import com.intranet.backend.common.dto.PaginatedResponse;
import com.intranet.backend.common.util.SecurityUtils;
import com.intranet.backend.user.dto.UserFilterDTO;
import com.intranet.backend.user.dto.UserRequestDTO;
import com.intranet.backend.user.dto.UserResponseDTO;
import com.intranet.backend.user.dto.UserUpdateDTO;
import com.intranet.backend.user.model.User;
import com.intranet.backend.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    // ===== Usuário Autenticado =====

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getCurrentUser() {
        log.info("Requisição para dados do usuário atual");

        String username = securityUtils.getCurrentUsername();
        UserResponseDTO user = userService.getByUsername(username);

        return ResponseEntity.ok(ApiResponse.success("Dados do usuário obtidos com sucesso", user));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateCurrentUser(
            @Valid @RequestBody UserUpdateDTO dto) {
        log.info("Requisição para atualizar dados do usuário atual");

        String username = securityUtils.getCurrentUsername();
        UserResponseDTO currentUser = userService.getByUsername(username);
        UserResponseDTO updated = userService.update(currentUser.getId(), dto);

        return ResponseEntity.ok(ApiResponse.success("Dados atualizados com sucesso", updated));
    }

    @PatchMapping("/me/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestParam String currentPassword, @RequestParam String newPassword) {
        log.info("Requisição para alterar senha do usuário atual");

        // Validar senha atual (será implementado no AuthService)
        String username = securityUtils.getCurrentUsername();
        UserResponseDTO currentUser = userService.getByUsername(username);

        // Aqui você deve validar a senha atual antes de alterar
        // Por segurança, recomendo fazer isso no AuthService
        userService.changePassword(currentUser.getId(), newPassword);

        return ResponseEntity.ok(ApiResponse.success("Senha alterada com sucesso"));
    }

    // ===== ADMIN =====

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> create(
            @Valid @RequestBody UserRequestDTO dto) {
        log.info("Requisição para criar usuário: {}", dto.getUsername());

        UserResponseDTO created = userService.create(dto);

        return ResponseEntity.ok(ApiResponse.success("Usuário criado com sucesso", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> update(
            @PathVariable String id, @Valid @RequestBody UserUpdateDTO dto) {
        log.info("Requisição para atualizar usuário: {}", id);

        UserResponseDTO updated = userService.update(id, dto);

        return ResponseEntity.ok(ApiResponse.success("Usuário atualizado com sucesso", updated));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<UserResponseDTO>>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para listar todos os usuários");

        Page<UserResponseDTO> page = userService.getAll(pageable);
        PaginatedResponse<UserResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(ApiResponse.success("Usuários listados com sucesso", response));
    }

    @PostMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<UserResponseDTO>>> filter(
            @RequestBody UserFilterDTO filter, @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para filtrar usuários");

        Page<UserResponseDTO> page = userService.filter(filter, pageable);
        PaginatedResponse<UserResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(ApiResponse.success("Usuários filtrados com sucesso", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getById(@PathVariable String id) {
        log.info("Requisição para buscar usuário: {}", id);

        UserResponseDTO user = userService.getById(id);

        return ResponseEntity.ok(ApiResponse.success("Usuário encontrado com sucesso", user));
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getByUsername(
            @PathVariable String username) {
        log.info("Requisição para buscar usuário por username: {}", username);

        UserResponseDTO user = userService.getByUsername(username);

        return ResponseEntity.ok(ApiResponse.success("Usuário encontrado com sucesso", user));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getByEmail(@PathVariable String email) {
        log.info("Requisição para buscar usuário por email: {}", email);

        UserResponseDTO user = userService.getByEmail(email);

        return ResponseEntity.ok(ApiResponse.success("Usuário encontrado com sucesso", user));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getActiveUsers() {
        log.info("Requisição para listar usuários ativos");

        List<UserResponseDTO> users = userService.getActiveUsers();

        return ResponseEntity.ok(
                ApiResponse.success("Usuários ativos listados com sucesso", users));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getUsersByRole(
            @PathVariable User.Role role) {
        log.info("Requisição para listar usuários por role: {}", role);

        List<UserResponseDTO> users = userService.getUsersByRole(role);

        return ResponseEntity.ok(
                ApiResponse.success("Usuários por role listados com sucesso", users));
    }

    @GetMapping("/first-access")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getUsersWithFirstAccess() {
        log.info("Requisição para listar usuários com primeiro acesso pendente");

        List<UserResponseDTO> users = userService.getUsersWithFirstAccess();

        return ResponseEntity.ok(
                ApiResponse.success("Usuários com primeiro acesso pendente listados", users));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable String id) {
        log.info("Requisição para ativar usuário: {}", id);

        userService.activate(id);

        return ResponseEntity.ok(ApiResponse.success("Usuário ativado com sucesso"));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable String id) {
        log.info("Requisição para desativar usuário: {}", id);

        userService.deactivate(id);

        return ResponseEntity.ok(ApiResponse.success("Usuário desativado com sucesso"));
    }

    @PatchMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unlock(@PathVariable String id) {
        log.info("Requisição para desbloquear usuário: {}", id);

        userService.unlockUser(id);

        return ResponseEntity.ok(ApiResponse.success("Usuário desbloqueado com sucesso"));
    }

    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable String id) {
        log.info("Requisição para resetar senha do usuário: {}", id);

        userService.resetPassword(id);

        return ResponseEntity.ok(ApiResponse.success("Senha resetada com sucesso"));
    }

    @PatchMapping("/{id}/change-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> changePasswordAdmin(
            @PathVariable String id, @RequestParam String newPassword) {
        log.info("Requisição para alterar senha do usuário: {}", id);

        userService.changePassword(id, newPassword);

        return ResponseEntity.ok(ApiResponse.success("Senha alterada com sucesso"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        log.info("Requisição para deletar usuário: {}", id);

        userService.delete(id);

        return ResponseEntity.ok(ApiResponse.success("Usuário deletado com sucesso"));
    }

    // ===== Estatísticas =====

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserStatisticsDTO>> getStatistics() {
        log.info("Requisição para estatísticas de usuários");

        UserStatisticsDTO statistics =
                UserStatisticsDTO.builder()
                        .totalUsers(userService.countUsers())
                        .activeUsers(userService.countActiveUsers())
                        .adminCount(userService.countByRole(User.Role.ADMIN))
                        .suporteCount(userService.countByRole(User.Role.SUPORTE))
                        .build();

        return ResponseEntity.ok(
                ApiResponse.success("Estatísticas obtidas com sucesso", statistics));
    }

    // ===== Health =====

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("User Service is UP", "OK"));
    }

    // ===== DTO Interno para Estatísticas =====

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class UserStatisticsDTO {
        private Long totalUsers;
        private Long activeUsers;
        private Long adminCount;
        private Long suporteCount;
    }
}
