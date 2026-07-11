package com.intranet.backend.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.intranet.backend.common.exception.BusinessException;
import com.intranet.backend.common.exception.ResourceNotFoundException;
import com.intranet.backend.user.dto.UserFilterDTO;
import com.intranet.backend.user.dto.UserRequestDTO;
import com.intranet.backend.user.dto.UserResponseDTO;
import com.intranet.backend.user.dto.UserUpdateDTO;
import com.intranet.backend.user.mapper.UserMapper;
import com.intranet.backend.user.model.User;
import com.intranet.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int BLOCK_DURATION_MINUTES = 30;

    @Override
    public UserResponseDTO create(UserRequestDTO dto) {
        log.info("Criando novo usuário: {}", dto.getUsername());

        // Validar username único
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("Username já está em uso");
        }

        // Validar email único
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email já está em uso");
        }

        User user = userMapper.toEntity(dto);
        user.setSenha(passwordEncoder.encode(dto.getSenha()));

        // Definir role padrão se não informada
        if (user.getRole() == null) {
            user.setRole(User.Role.SUPORTE);
        }

        User saved = userRepository.save(user);
        log.info("Usuário criado com sucesso: {}", saved.getId());

        return userMapper.toResponseDTO(saved);
    }

    @Override
    @CacheEvict(
            value = {"users", "user"},
            allEntries = true)
    public UserResponseDTO update(String id, UserUpdateDTO dto) {
        log.info("Atualizando usuário: {}", id);

        User user = getEntityById(id);

        // Se email está sendo alterado, verificar se já existe
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new BusinessException("Email já está em uso");
            }
        }

        userMapper.updateEntity(dto, user);
        User updated = userRepository.save(user);
        log.info("Usuário atualizado com sucesso: {}", id);

        return userMapper.toResponseDTO(updated);
    }

    @Override
    @Cacheable(value = "user", key = "#id")
    public UserResponseDTO getById(String id) {
        log.info("Buscando usuário por ID: {}", id);

        User user = getEntityById(id);
        return userMapper.toResponseDTO(user);
    }

    @Override
    public UserResponseDTO getByUsername(String username) {
        log.info("Buscando usuário por username: {}", username);

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Usuário não encontrado com username: "
                                                        + username));

        return userMapper.toResponseDTO(user);
    }

    @Override
    public UserResponseDTO getByEmail(String email) {
        log.info("Buscando usuário por email: {}", email);

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Usuário não encontrado com email: " + email));

        return userMapper.toResponseDTO(user);
    }

    @Override
    @Cacheable(value = "users", key = "#pageable.pageNumber")
    public Page<UserResponseDTO> getAll(Pageable pageable) {
        log.info("Buscando todos os usuários");

        return userRepository.findAll(pageable).map(userMapper::toResponseDTO);
    }

    @Override
    public Page<UserResponseDTO> filter(UserFilterDTO filter, Pageable pageable) {
        log.info("Filtrando usuários");

        return userRepository
                .search(
                        filter.getNome(),
                        filter.getUsername(),
                        filter.getEmail(),
                        filter.getRole(),
                        filter.getAtivo(),
                        pageable)
                .map(userMapper::toResponseDTO);
    }

    @Override
    @CacheEvict(
            value = {"users", "user"},
            allEntries = true)
    public void delete(String id) {
        log.info("Deletando usuário: {}", id);

        User user = getEntityById(id);

        // Impedir deleção do último ADMIN
        if (user.getRole() == User.Role.ADMIN) {
            long adminCount = userRepository.countByRole(User.Role.ADMIN);
            if (adminCount <= 1) {
                throw new BusinessException("Não é possível deletar o último administrador");
            }
        }

        userRepository.delete(user);
        log.info("Usuário deletado com sucesso: {}", id);
    }

    @Override
    @CacheEvict(
            value = {"users", "user"},
            allEntries = true)
    public void activate(String id) {
        log.info("Ativando usuário: {}", id);

        User user = getEntityById(id);
        user.setAtivo(true);
        user.setTentativasLogin(0);
        user.setBloqueadoAte(null);
        userRepository.save(user);

        log.info("Usuário ativado com sucesso: {}", id);
    }

    @Override
    @CacheEvict(
            value = {"users", "user"},
            allEntries = true)
    public void deactivate(String id) {
        log.info("Desativando usuário: {}", id);

        User user = getEntityById(id);

        // Impedir desativação do último ADMIN
        if (user.getRole() == User.Role.ADMIN) {
            long adminCount = userRepository.countByRole(User.Role.ADMIN);
            if (adminCount <= 1) {
                throw new BusinessException("Não é possível desativar o último administrador");
            }
        }

        user.setAtivo(false);
        userRepository.save(user);

        log.info("Usuário desativado com sucesso: {}", id);
    }

    @Override
    @CacheEvict(
            value = {"users", "user"},
            allEntries = true)
    public void changePassword(String id, String newPassword) {
        log.info("Alterando senha do usuário: {}", id);

        User user = getEntityById(id);
        user.setSenha(passwordEncoder.encode(newPassword));
        user.setPrimeiroAcesso(false);
        userRepository.save(user);

        log.info("Senha alterada com sucesso: {}", id);
    }

    @Override
    @CacheEvict(
            value = {"users", "user"},
            allEntries = true)
    public void resetPassword(String id) {
        log.info("Resetando senha do usuário: {}", id);

        User user = getEntityById(id);
        String newPassword = generateRandomPassword();
        user.setSenha(passwordEncoder.encode(newPassword));
        user.setPrimeiroAcesso(true);
        userRepository.save(user);

        log.info("Senha resetada com sucesso: {}", id);
        // Em produção, enviar email com a nova senha
    }

    @Override
    public void registerLogin(String username) {
        log.info("Registrando login do usuário: {}", username);

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        user.setUltimoAcesso(LocalDateTime.now());
        user.setTentativasLogin(0);
        user.setBloqueadoAte(null);
        user.setPrimeiroAcesso(false);
        userRepository.save(user);
    }

    @Override
    public void handleFailedLogin(String username) {
        log.warn("Tentativa de login falhou para: {}", username);

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        user.setTentativasLogin(user.getTentativasLogin() + 1);

        // Bloquear usuário após MAX_LOGIN_ATTEMPTS tentativas
        if (user.getTentativasLogin() >= MAX_LOGIN_ATTEMPTS) {
            LocalDateTime bloqueadoAte = LocalDateTime.now().plusMinutes(BLOCK_DURATION_MINUTES);
            user.setBloqueadoAte(bloqueadoAte);
            log.warn("Usuário {} bloqueado até {}", username, bloqueadoAte);
        }

        userRepository.save(user);
    }

    @Override
    @CacheEvict(
            value = {"users", "user"},
            allEntries = true)
    public void unlockUser(String id) {
        log.info("Desbloqueando usuário: {}", id);

        User user = getEntityById(id);
        user.setTentativasLogin(0);
        user.setBloqueadoAte(null);
        userRepository.save(user);

        log.info("Usuário desbloqueado com sucesso: {}", id);
    }

    @Override
    public List<UserResponseDTO> getActiveUsers() {
        log.info("Buscando usuários ativos");

        return userRepository.findByAtivoTrue(Pageable.unpaged()).stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> getUsersByRole(User.Role role) {
        log.info("Buscando usuários por role: {}", role);

        return userRepository.findActiveByRole(role).stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> getUsersWithFirstAccess() {
        log.info("Buscando usuários com primeiro acesso pendente");

        return userRepository.findUsersWithFirstAccess().stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countUsers() {
        return userRepository.count();
    }

    @Override
    public long countActiveUsers() {
        return userRepository.countActiveUsers();
    }

    @Override
    public long countByRole(User.Role role) {
        return userRepository.countByRole(role);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User getEntityById(String id) {
        return userRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Usuário não encontrado com ID: " + id));
    }

    // Métodos auxiliares privados

    private String generateRandomPassword() {
        // Gerar senha aleatória com 10 caracteres
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            int index = (int) (Math.random() * chars.length());
            password.append(chars.charAt(index));
        }
        return password.toString();
    }
}
