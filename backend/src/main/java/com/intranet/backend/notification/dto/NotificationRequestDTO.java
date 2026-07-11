package com.intranet.backend.notification.dto;

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
public class NotificationRequestDTO {

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 100, message = "Título deve ter no máximo 100 caracteres")
    private String title;

    @NotBlank(message = "Mensagem é obrigatória")
    @Size(max = 500, message = "Mensagem deve ter no máximo 500 caracteres")
    private String message;

    @NotBlank(message = "ID do usuário é obrigatório")
    private String userId;

    private String userName;

    @NotBlank(message = "Tipo é obrigatório")
    private String type; // INFO, SUCCESS, WARNING, ERROR, REMINDER, ALERT, SYSTEM

    private String category;

    private String link;

    private String icon;

    private String color;

    private LocalDateTime expiresAt;
}
