package com.intranet.backend.notification.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.intranet.backend.notification.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    // Buscar por usuário
    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    // Buscar não lidas
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
            String userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);

    // Buscar por tipo
    Page<Notification> findByUserIdAndType(
            String userId, Notification.NotificationType type, Pageable pageable);

    // Buscar não expiradas
    @Query(
            "SELECT n FROM Notification n WHERE n.userId = :userId AND (n.expiresAt IS NULL OR n.expiresAt > :now) ORDER BY n.createdAt DESC")
    Page<Notification> findActiveByUserId(
            @Param("userId") String userId, @Param("now") LocalDateTime now, Pageable pageable);

    // Contar não lidas
    @Query(
            "SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false AND (n.expiresAt IS NULL OR n.expiresAt > :now)")
    long countUnreadByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);

    // Marcar como lida
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") String id, @Param("readAt") LocalDateTime readAt);

    // Marcar todas como lidas
    @Modifying
    @Query(
            "UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") String userId, @Param("readAt") LocalDateTime readAt);

    // Deletar notificações antigas
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :date")
    void deleteExpired(@Param("date") LocalDateTime date);

    // Buscar por palavras-chave
    @Query(
            "SELECT n FROM Notification n WHERE n.userId = :userId AND (LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(n.message) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Notification> searchByUserId(
            @Param("userId") String userId, @Param("search") String search, Pageable pageable);
}
