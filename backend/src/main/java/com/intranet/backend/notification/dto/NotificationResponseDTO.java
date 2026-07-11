package com.intranet.backend.notification.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private String id;
    private String title;
    private String message;
    private String userId;
    private String userName;
    private String type;
    private String category;
    private Boolean isRead;
    private LocalDateTime readAt;
    private String link;
    private String icon;
    private String color;
    private Boolean isSystem;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String timeAgo;
    private Boolean isExpired;
}
