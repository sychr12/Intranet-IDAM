package com.intranet.backend.notification.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.intranet.backend.common.dto.ApiResponse;
import com.intranet.backend.common.dto.PaginatedResponse;
import com.intranet.backend.notification.dto.NotificationRequestDTO;
import com.intranet.backend.notification.dto.NotificationResponseDTO;
import com.intranet.backend.notification.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    // ===== Usuário =====

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<PaginatedResponse<NotificationResponseDTO>>>
            getMyNotifications(
                    @RequestParam String userId, @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para notificações do usuário: {}", userId);

        Page<NotificationResponseDTO> page = notificationService.getByUserId(userId, pageable);
        PaginatedResponse<NotificationResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(ApiResponse.success("Notificações obtidas com sucesso", response));
    }

    @GetMapping("/me/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<PaginatedResponse<NotificationResponseDTO>>>
            getMyUnreadNotifications(
                    @RequestParam String userId, @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para notificações não lidas do usuário: {}", userId);

        Page<NotificationResponseDTO> page =
                notificationService.getUnreadByUserId(userId, pageable);
        PaginatedResponse<NotificationResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(
                ApiResponse.success("Notificações não lidas obtidas com sucesso", response));
    }

    @GetMapping("/me/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<PaginatedResponse<NotificationResponseDTO>>>
            getMyActiveNotifications(
                    @RequestParam String userId, @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para notificações ativas do usuário: {}", userId);

        Page<NotificationResponseDTO> page =
                notificationService.getActiveByUserId(userId, pageable);
        PaginatedResponse<NotificationResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(
                ApiResponse.success("Notificações ativas obtidas com sucesso", response));
    }

    @GetMapping("/me/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<Long>> countUnread(@RequestParam String userId) {
        log.info("Requisição para contar notificações não lidas do usuário: {}", userId);

        long count = notificationService.countUnreadByUserId(userId);

        return ResponseEntity.ok(ApiResponse.success("Contagem de notificações não lidas", count));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String id) {
        log.info("Requisição para marcar notificação como lida: {}", id);

        notificationService.markAsRead(id);

        return ResponseEntity.ok(ApiResponse.success("Notificação marcada como lida"));
    }

    @PatchMapping("/me/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@RequestParam String userId) {
        log.info("Requisição para marcar todas as notificações como lidas: {}", userId);

        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok(ApiResponse.success("Todas as notificações marcadas como lidas"));
    }

    // ===== Admin =====

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> create(
            @Valid @RequestBody NotificationRequestDTO dto) {
        log.info("Requisição para criar notificação para usuário: {}", dto.getUserId());

        NotificationResponseDTO response = notificationService.create(dto);

        return ResponseEntity.ok(ApiResponse.success("Notificação criada com sucesso", response));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> createBulk(
            @Valid @RequestBody List<NotificationRequestDTO> dtos) {
        log.info("Requisição para criar {} notificações em lote", dtos.size());

        List<NotificationResponseDTO> responses = notificationService.createBulk(dtos);

        return ResponseEntity.ok(
                ApiResponse.success("Notificações criadas com sucesso", responses));
    }

    @PostMapping("/system/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendSystemNotification(
            @PathVariable String userId, @RequestParam String title, @RequestParam String message) {
        log.info("Requisição para enviar notificação do sistema para usuário: {}", userId);

        notificationService.sendSystemNotification(userId, title, message);

        return ResponseEntity.ok(ApiResponse.success("Notificação do sistema enviada com sucesso"));
    }

    @PostMapping("/system/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendSystemNotificationToAll(
            @RequestParam String title, @RequestParam String message) {
        log.info("Requisição para enviar notificação do sistema para todos os usuários");

        notificationService.sendSystemNotificationToAll(title, message);

        return ResponseEntity.ok(ApiResponse.success("Notificação do sistema enviada para todos"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        log.info("Requisição para deletar notificação: {}", id);

        notificationService.delete(id);

        return ResponseEntity.ok(ApiResponse.success("Notificação deletada com sucesso"));
    }

    @DeleteMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllByUser(@PathVariable String userId) {
        log.info("Requisição para deletar todas as notificações do usuário: {}", userId);

        notificationService.deleteAllByUserId(userId);

        return ResponseEntity.ok(
                ApiResponse.success("Todas as notificações deletadas com sucesso"));
    }

    // ===== Health =====

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Notification Service is UP", "OK"));
    }
}
