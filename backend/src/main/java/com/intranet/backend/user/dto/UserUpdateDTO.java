package com.intranet.backend.user.dto;

import java.time.LocalDateTime;

import com.intranet.backend.user.model.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {

    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @Email(message = "Email deve ser válido")
    private String email;

    private String foto;

    private String telefone;

    private String setor;

    private String cargo;

    private LocalDateTime dataNascimento;

    private LocalDateTime dataAdmissao;

    private Boolean ativo;

    private User.Role role;
}
