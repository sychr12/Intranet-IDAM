package com.intranet.backend.theme.model;

import java.time.LocalDate;
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
        name = "themes",
        indexes = {
            @Index(name = "idx_theme_name", columnList = "name"),
            @Index(name = "idx_theme_active", columnList = "is_active"),
            @Index(name = "idx_theme_start_date", columnList = "start_date"),
            @Index(name = "idx_theme_end_date", columnList = "end_date")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Theme {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(length = 100)
    private String displayName;

    @Column(length = 500)
    private String description;

    @Column(length = 255)
    private String icon;

    @Column(length = 255)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ThemeType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ThemeStatus status = ThemeStatus.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor;

    @Column(name = "background_color", length = 7)
    private String backgroundColor;

    @Column(name = "text_color", length = 7)
    private String textColor;

    @Column(name = "accent_color", length = 7)
    private String accentColor;

    @Column(name = "font_family", length = 100)
    private String fontFamily;

    @Column(columnDefinition = "TEXT")
    private String customCss;

    @Column(columnDefinition = "TEXT")
    private String customJs;

    @Column(name = "config", columnDefinition = "TEXT")
    private String config;

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ThemeType {
        SEASONAL, // Natal, Ano Novo, Carnaval, Páscoa, Festa Junina
        CAUSE, // Outubro Rosa, Novembro Azul
        EVENT, // Eventos específicos
        CUSTOM, // Temas personalizados
        HOLIDAY, // Feriados
        SPECIAL // Temas especiais
    }

    public enum ThemeStatus {
        DRAFT,
        SCHEDULED,
        ACTIVE,
        INACTIVE,
        EXPIRED
    }
}
