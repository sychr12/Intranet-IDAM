package com.intranet.backend.user.dto;

import com.intranet.backend.user.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterDTO {
    private String nome;
    private String username;
    private String email;
    private User.Role role;
    private Boolean ativo;
    private String setor;
    private String cargo;
    private Boolean primeiroAcesso;
}
