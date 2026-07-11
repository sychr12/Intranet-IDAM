package com.intranet.backend.notification.mapper;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.intranet.backend.common.util.DateUtils;
import com.intranet.backend.notification.dto.NotificationRequestDTO;
import com.intranet.backend.notification.dto.NotificationResponseDTO;
import com.intranet.backend.notification.model.Notification;

@Component
public class NotificationMapper {

    public Notification toEntity(NotificationRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return Notification.builder()
                .title(dto.getTitle())
                .message(dto.getMessage())
                .userId(dto.getUserId())
                .userName(dto.getUserName())
                .type(Notification.NotificationType.valueOf(dto.getType()))
                .category(dto.getCategory())
                .link(dto.getLink())
                .icon(dto.getIcon() != null ? dto.getIcon() : getDefaultIcon(dto.getType()))
                .color(dto.getColor() != null ? dto.getColor() : getDefaultColor(dto.getType()))
                .expiresAt(dto.getExpiresAt())
                .isRead(false)
                .isSystem(true)
                .build();
    }

    public NotificationResponseDTO toDTO(Notification notification) {
        if (notification == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();

        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .userId(notification.getUserId())
                .userName(notification.getUserName())
                .type(notification.getType().name())
                .category(notification.getCategory())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .link(notification.getLink())
                .icon(notification.getIcon())
                .color(notification.getColor())
                .isSystem(notification.getIsSystem())
                .expiresAt(notification.getExpiresAt())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .timeAgo(DateUtils.getTimeAgo(notification.getCreatedAt()))
                .isExpired(
                        notification.getExpiresAt() != null
                                && notification.getExpiresAt().isBefore(now))
                .build();
    }

    private String getDefaultIcon(String type) {
        return switch (type) {
            case "INFO" -> "info";
            case "SUCCESS" -> "check-circle";
            case "WARNING" -> "warning";
            case "ERROR" -> "x-circle";
            case "REMINDER" -> "bell";
            case "ALERT" -> "alert-triangle";
            case "SYSTEM" -> "settings";
            default -> "bell";
        };
    }

    private String getDefaultColor(String type) {
        return switch (type) {
            case "INFO" -> "#3B82F6"; // Azul
            case "SUCCESS" -> "#10B981"; // Verde
            case "WARNING" -> "#F59E0B"; // Amarelo
            case "ERROR" -> "#EF4444"; // Vermelho
            case "REMINDER" -> "#8B5CF6"; // Roxo
            case "ALERT" -> "#F97316"; // Laranja
            case "SYSTEM" -> "#6B7280"; // Cinza
            default -> "#3B82F6";
        };
    }
}
