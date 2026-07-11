package com.intranet.backend.notification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.intranet.backend.common.exception.BusinessException;
import com.intranet.backend.common.exception.ResourceNotFoundException;
import com.intranet.backend.notification.dto.NotificationFilterDTO;
import com.intranet.backend.notification.dto.NotificationRequestDTO;
import com.intranet.backend.notification.dto.NotificationResponseDTO;
import com.intranet.backend.notification.mapper.NotificationMapper;
import com.intranet.backend.notification.model.Notification;
import com.intranet.backend.notification.repository.NotificationRepository;
import com.intranet.backend.user.model.User;
import com.intranet.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationResponseDTO create(NotificationRequestDTO dto) {
        log.info("Criando notificação para usuário: {}", dto.getUserId());

        // Verificar se usuário existe
        if (!userRepository.existsById(dto.getUserId())) {
            throw new BusinessException("Usuário não encontrado");
        }

        Notification notification = notificationMapper.toEntity(dto);

        // Buscar nome do usuário se não foi fornecido
        if (notification.getUserName() == null) {
            User user = userRepository.findById(dto.getUserId()).orElse(null);
            if (user != null) {
                notification.setUserName(user.getNome());
            }
        }

        Notification saved = notificationRepository.save(notification);
        log.info("Notificação criada com sucesso: {}", saved.getId());

        return notificationMapper.toDTO(saved);
    }

    @Override
    public List<NotificationResponseDTO> createBulk(List<NotificationRequestDTO> dtos) {
        log.info("Criando {} notificações em lote", dtos.size());

        List<Notification> notifications =
                dtos.stream().map(notificationMapper::toEntity).collect(Collectors.toList());

        List<Notification> saved = notificationRepository.saveAll(notifications);

        return saved.stream().map(notificationMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "notifications", key = "#userId + '_' + #pageable.pageNumber")
    public Page<NotificationResponseDTO> getByUserId(String userId, Pageable pageable) {
        log.info("Buscando notificações do usuário: {}", userId);

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toDTO);
    }

    @Override
    public Page<NotificationResponseDTO> getUnreadByUserId(String userId, Pageable pageable) {
        log.info("Buscando notificações não lidas do usuário: {}", userId);

        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toDTO);
    }

    @Override
    public Page<NotificationResponseDTO> getActiveByUserId(String userId, Pageable pageable) {
        log.info("Buscando notificações ativas do usuário: {}", userId);

        return notificationRepository
                .findActiveByUserId(userId, LocalDateTime.now(), pageable)
                .map(notificationMapper::toDTO);
    }

    @Override
    public Page<NotificationResponseDTO> filter(NotificationFilterDTO filter, Pageable pageable) {
        log.info("Filtrando notificações para usuário: {}", filter.getUserId());

        if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
            return notificationRepository
                    .searchByUserId(filter.getUserId(), filter.getSearch(), pageable)
                    .map(notificationMapper::toDTO);
        }

        if (filter.getIsRead() != null) {
            if (filter.getIsRead()) {
                return notificationRepository
                        .findByUserIdOrderByCreatedAtDesc(filter.getUserId(), pageable)
                        .map(notificationMapper::toDTO);
            } else {
                return notificationRepository
                        .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                                filter.getUserId(), pageable)
                        .map(notificationMapper::toDTO);
            }
        }

        if (filter.getType() != null) {
            return notificationRepository
                    .findByUserIdAndType(
                            filter.getUserId(),
                            Notification.NotificationType.valueOf(filter.getType()),
                            pageable)
                    .map(notificationMapper::toDTO);
        }

        return getByUserId(filter.getUserId(), pageable);
    }

    @Override
    public NotificationResponseDTO getById(String id) {
        log.info("Buscando notificação por ID: {}", id);

        Notification notification =
                notificationRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Notificação não encontrada"));

        return notificationMapper.toDTO(notification);
    }

    @Override
    public void markAsRead(String id) {
        log.info("Marcando notificação como lida: {}", id);

        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notificação não encontrada");
        }

        notificationRepository.markAsRead(id, LocalDateTime.now());
    }

    @Override
    public void markAllAsRead(String userId) {
        log.info("Marcando todas as notificações como lidas para usuário: {}", userId);

        notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    @Override
    @CacheEvict(value = "notifications", allEntries = true)
    public void delete(String id) {
        log.info("Deletando notificação: {}", id);

        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notificação não encontrada");
        }

        notificationRepository.deleteById(id);
    }

    @Override
    @CacheEvict(value = "notifications", allEntries = true)
    public void deleteAllByUserId(String userId) {
        log.info("Deletando todas as notificações do usuário: {}", userId);

        List<Notification> notifications =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
    }

    @Override
    public long countUnreadByUserId(String userId) {
        return notificationRepository.countUnreadByUserId(userId, LocalDateTime.now());
    }

    @Override
    public void sendSystemNotification(String userId, String title, String message) {
        log.info("Enviando notificação do sistema para usuário: {}", userId);

        NotificationRequestDTO dto =
                NotificationRequestDTO.builder()
                        .userId(userId)
                        .title(title)
                        .message(message)
                        .type("SYSTEM")
                        .category("Sistema")
                        .icon("settings")
                        .color("#6B7280")
                        .build();

        create(dto);
    }

    @Override
    public void sendSystemNotificationToAll(String title, String message) {
        log.info("Enviando notificação do sistema para todos os usuários");

        List<User> users = userRepository.findAll();

        List<NotificationRequestDTO> dtos =
                users.stream()
                        .map(
                                user ->
                                        NotificationRequestDTO.builder()
                                                .userId(user.getId())
                                                .userName(user.getNome())
                                                .title(title)
                                                .message(message)
                                                .type("SYSTEM")
                                                .category("Sistema")
                                                .icon("settings")
                                                .color("#6B7280")
                                                .build())
                        .collect(Collectors.toList());

        createBulk(dtos);
    }

    @Override
    @Scheduled(cron = "0 0 3 * * ?") // Executa todos os dias às 3h
    public void cleanExpiredNotifications() {
        log.info("Limpando notificações expiradas");

        LocalDateTime cutoff = LocalDateTime.now();
        notificationRepository.deleteExpired(cutoff);

        log.info("Limpeza de notificações expiradas concluída");
    }
}
