package com.intranet.backend.popup.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopupResponseDTO {
    private String id;
    private String title;
    private String message;
    private String imageUrl;
    private String link;
    private String linkText;
    private Integer priority;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer displayCount;
    private Integer maxDisplay;
    private Boolean dismissible;
    private String type;
    private String position;
    private String size;
    private String backgroundColor;
    private String textColor;
    private String targetRoles;
    private String targetUsers;
    private Boolean isSystem;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status; // ACTIVE, INACTIVE, SCHEDULED, EXPIRED
    private Boolean isVisible; // Para o frontend saber se deve exibir
}
