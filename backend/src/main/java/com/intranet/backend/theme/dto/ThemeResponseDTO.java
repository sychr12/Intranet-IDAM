package com.intranet.backend.theme.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeResponseDTO {
    private String id;
    private String name;
    private String slug;
    private String displayName;
    private String description;
    private String icon;
    private String imageUrl;
    private String type;
    private String status;
    private Boolean isActive;
    private Boolean isDefault;
    private LocalDate startDate;
    private LocalDate endDate;
    private String primaryColor;
    private String secondaryColor;
    private String backgroundColor;
    private String textColor;
    private String accentColor;
    private String fontFamily;
    private String customCss;
    private String customJs;
    private String config;
    private Integer priority;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isCurrent;
    private Integer daysUntilStart;
    private Integer daysUntilEnd;
    private String timeRemaining;
}
