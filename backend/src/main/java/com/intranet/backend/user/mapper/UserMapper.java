package com.intranet.backend.user.mapper;

import org.springframework.stereotype.Component;

import com.intranet.backend.user.dto.UserRequestDTO;
import com.intranet.backend.user.dto.UserResponseDTO;
import com.intranet.backend.user.dto.UserUpdateDTO;
import com.intranet.backend.user.model.User;

@Component
public class UserMapper {

    public User toEntity(UserRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return User.builder()
                .nome(dto.getNome())
                .username(dto.getUsername())
                .email(dto.getEmail())
                .senha(dto.getSenha())
                .role(dto.getRole() != null ? dto.getRole() : User.Role.SUPORTE)
                .foto(dto.getFoto())
                .telefone(dto.getTelefone())
                .setor(dto.getSetor())
                .cargo(dto.getCargo())
                .dataNascimento(dto.getDataNascimento())
                .dataAdmissao(dto.getDataAdmissao())
                .ativo(true)
                .primeiroAcesso(true)
                .tentativasLogin(0)
                .build();
    }

    public UserResponseDTO toResponseDTO(User user) {
        if (user == null) {
            return null;
        }

        String status;
        if (!user.getAtivo()) {
            status = "INATIVO";
        } else if (user.isLocked()) {
            status = "BLOQUEADO";
        } else {
            status = "ATIVO";
        }

        return UserResponseDTO.builder()
                .id(user.getId())
                .nome(user.getNome())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .foto(user.getFoto())
                .telefone(user.getTelefone())
                .setor(user.getSetor())
                .cargo(user.getCargo())
                .dataNascimento(user.getDataNascimento())
                .dataAdmissao(user.getDataAdmissao())
                .ativo(user.getAtivo())
                .primeiroAcesso(user.getPrimeiroAcesso())
                .ultimoAcesso(user.getUltimoAcesso())
                .criadoEm(user.getCriadoEm())
                .atualizadoEm(user.getAtualizadoEm())
                .isLocked(user.isLocked())
                .status(status)
                .roleDisplay(getRoleDisplay(user.getRole()))
                .build();
    }

    public void updateEntity(UserUpdateDTO dto, User user) {
        if (dto.getNome() != null) {
            user.setNome(dto.getNome());
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getFoto() != null) {
            user.setFoto(dto.getFoto());
        }
        if (dto.getTelefone() != null) {
            user.setTelefone(dto.getTelefone());
        }
        if (dto.getSetor() != null) {
            user.setSetor(dto.getSetor());
        }
        if (dto.getCargo() != null) {
            user.setCargo(dto.getCargo());
        }
        if (dto.getDataNascimento() != null) {
            user.setDataNascimento(dto.getDataNascimento());
        }
        if (dto.getDataAdmissao() != null) {
            user.setDataAdmissao(dto.getDataAdmissao());
        }
        if (dto.getAtivo() != null) {
            user.setAtivo(dto.getAtivo());
        }
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
    }

    private String getRoleDisplay(User.Role role) {
        return switch (role) {
            case ADMIN -> "Administrador";
            case SUPORTE -> "Suporte";
        };
    }
}
