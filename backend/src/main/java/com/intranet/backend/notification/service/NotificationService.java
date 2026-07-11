package com.intranet.backend.notification.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.intranet.backend.notification.dto.NotificationFilterDTO;
import com.intranet.backend.notification.dto.NotificationRequestDTO;
import com.intranet.backend.notification.dto.NotificationResponseDTO;

public interface NotificationService {

    // Criar
    NotificationResponseDTO create(NotificationRequestDTO dto);

    // Criar múltiplas
    List<NotificationResponseDTO> createBulk(List<NotificationRequestDTO> dtos);

    // Buscar
    Page<NotificationResponseDTO> getByUserId(String userId, Pageable pageable);

    Page<NotificationResponseDTO> getUnreadByUserId(String userId, Pageable pageable);

    Page<NotificationResponseDTO> getActiveByUserId(String userId, Pageable pageable);

    Page<NotificationResponseDTO> filter(NotificationFilterDTO filter, Pageable pageable);

    // Buscar por ID
    NotificationResponseDTO getById(String id);

    // Marcar como lida
    void markAsRead(String id);

    void markAllAsRead(String userId);

    // Deletar
    void delete(String id);

    void deleteAllByUserId(String userId);

    // Contar
    long countUnreadByUserId(String userId);

    // Sistema
    void sendSystemNotification(String userId, String title, String message);

    void sendSystemNotificationToAll(String title, String message);

    // Limpeza
    void cleanExpiredNotifications();
}
