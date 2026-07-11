package com.intranet.backend.theme.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 50, message = "Nome deve ter no máximo 50 caracteres")
    private String name;

    @NotBlank(message = "Slug é obrigatório")
    @Pattern(
            regexp = "^[a-z0-9-]+$",
            message = "Slug deve conter apenas letras minúsculas, números e hífens")
    @Size(max = 50, message = "Slug deve ter no máximo 50 caracteres")
    private String slug;

    @Size(max = 100, message = "Nome de exibição deve ter no máximo 100 caracteres")
    private String displayName;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    private String description;

    @Size(max = 255, message = "URL do ícone deve ter no máximo 255 caracteres")
    private String icon;

    @Size(max = 255, message = "URL da imagem deve ter no máximo 255 caracteres")
    private String imageUrl;

    @NotBlank(message = "Tipo é obrigatório")
    private String type; // SEASONAL, CAUSE, EVENT, CUSTOM, HOLIDAY, SPECIAL

    private String status; // DRAFT, SCHEDULED, ACTIVE, INACTIVE, EXPIRED

    private Boolean isActive;

    private Boolean isDefault;

    private LocalDate startDate;

    private LocalDate endDate;

    @Pattern(
            regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
            message = "Cor deve estar no formato hexadecimal (#RRGGBB)")
    private String primaryColor;

    @Pattern(
            regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
            message = "Cor deve estar no formato hexadecimal (#RRGGBB)")
    private String secondaryColor;

    @Pattern(
            regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
            message = "Cor deve estar no formato hexadecimal (#RRGGBB)")
    private String backgroundColor;

    @Pattern(
            regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
            message = "Cor deve estar no formato hexadecimal (#RRGGBB)")
    private String textColor;

    @Pattern(
            regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
            message = "Cor deve estar no formato hexadecimal (#RRGGBB)")
    private String accentColor;

    @Size(max = 100, message = "Fonte deve ter no máximo 100 caracteres")
    private String fontFamily;

    private String customCss;

    private String customJs;

    private String config;

    private Integer priority;
}
