package com.intranet.backend.user.dto;

import java.time.LocalDateTime;

import com.intranet.backend.user.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private String id;
    private String nome;
    private String username;
    private String email;
    private User.Role role;
    private String foto;
    private String telefone;
    private String setor;
    private String cargo;
    private LocalDateTime dataNascimento;
    private LocalDateTime dataAdmissao;
    private Boolean ativo;
    private Boolean primeiroAcesso;
    private LocalDateTime ultimoAcesso;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
    private Boolean isLocked;
    private String status;
    private String roleDisplay;
}
