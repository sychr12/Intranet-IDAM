package com.intranet.backend.popup.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopupRequestDTO {

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 100, message = "Título deve ter no máximo 100 caracteres")
    private String title;

    @NotBlank(message = "Mensagem é obrigatória")
    @Size(max = 500, message = "Mensagem deve ter no máximo 500 caracteres")
    private String message;

    @Size(max = 255, message = "URL da imagem deve ter no máximo 255 caracteres")
    private String imageUrl;

    @Size(max = 255, message = "Link deve ter no máximo 255 caracteres")
    private String link;

    @Size(max = 50, message = "Texto do link deve ter no máximo 50 caracteres")
    private String linkText;

    private Integer priority;

    private Boolean isActive;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer maxDisplay;

    private Boolean dismissible;

    private String type; // INFO, SUCCESS, WARNING, ERROR, PROMOTIONAL, SYSTEM

    private String position; // TOP, BOTTOM, CENTER, TOP_RIGHT, TOP_LEFT, BOTTOM_RIGHT, BOTTOM_LEFT

    private String size; // SMALL, MEDIUM, LARGE, FULL

    private String backgroundColor;

    private String textColor;

    private String targetRoles; // ADMIN, SUPORTE (separados por vírgula)

    private String targetUsers; // IDs de usuários (separados por vírgula)
}
