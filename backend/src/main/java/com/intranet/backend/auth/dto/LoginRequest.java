package com.intranet.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(message = "O usuário é obrigatório.")
        String username,

        @NotBlank(message = "A senha é obrigatória.")
        String senha

) {
    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return senha;
    }
}
