package com.intranet.backend.popup.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "popups",
        indexes = {
            @Index(name = "idx_popup_active", columnList = "is_active"),
            @Index(name = "idx_popup_priority", columnList = "priority"),
            @Index(name = "idx_popup_start_date", columnList = "start_date"),
            @Index(name = "idx_popup_end_date", columnList = "end_date")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Popup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 255)
    private String imageUrl;

    @Column(length = 255)
    private String link;

    @Column(length = 50)
    private String linkText;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 0; // 0 = baixo, 1 = médio, 2 = alto

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "display_count", nullable = false)
    @Builder.Default
    private Integer displayCount = 0;

    @Column(name = "max_display")
    @Builder.Default
    private Integer maxDisplay = 0; // 0 = ilimitado

    @Column(name = "dismissible", nullable = false)
    @Builder.Default
    private Boolean dismissible = true;

    @Column(length = 50)
    private String type; // INFO, SUCCESS, WARNING, ERROR, PROMOTIONAL

    @Column(length = 20)
    private String position; // TOP, BOTTOM, CENTER

    @Column(length = 20)
    private String size; // SMALL, MEDIUM, LARGE

    @Column(length = 7)
    private String backgroundColor;

    @Column(length = 7)
    private String textColor;

    @Column(name = "target_roles", length = 255)
    private String targetRoles; // ADMIN, SUPORTE, ALL (separados por vírgula)

    @Column(name = "target_users", length = 500)
    private String targetUsers; // IDs de usuários (separados por vírgula)

    @Column(nullable = false)
    @Builder.Default
    private Boolean isSystem = false;

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PopupType {
        INFO,
        SUCCESS,
        WARNING,
        ERROR,
        PROMOTIONAL,
        SYSTEM
    }

    public enum PopupPosition {
        TOP,
        BOTTOM,
        CENTER,
        TOP_RIGHT,
        TOP_LEFT,
        BOTTOM_RIGHT,
        BOTTOM_LEFT
    }

    public enum PopupSize {
        SMALL,
        MEDIUM,
        LARGE,
        FULL
    }
}
