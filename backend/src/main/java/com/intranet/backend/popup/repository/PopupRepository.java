package com.intranet.backend.popup.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.intranet.backend.popup.model.Popup;

@Repository
public interface PopupRepository extends JpaRepository<Popup, String> {

    // Buscar ativos
    List<Popup> findByIsActiveTrueOrderByPriorityDesc();

    // Buscar ativos que estão no período
    @Query(
            "SELECT p FROM Popup p WHERE p.isActive = true AND "
                    + "(p.startDate IS NULL OR p.startDate <= :now) AND "
                    + "(p.endDate IS NULL OR p.endDate >= :now) "
                    + "ORDER BY p.priority DESC")
    List<Popup> findActivePopups(@Param("now") LocalDateTime now);

    // Buscar por tipo
    Page<Popup> findByType(String type, Pageable pageable);

    // Buscar por status
    @Query(
            "SELECT p FROM Popup p WHERE "
                    + "(:status = 'ALL' OR "
                    + "(:status = 'ACTIVE' AND p.isActive = true AND (p.startDate IS NULL OR p.startDate <= :now) AND (p.endDate IS NULL OR p.endDate >= :now)) OR "
                    + "(:status = 'INACTIVE' AND p.isActive = false) OR "
                    + "(:status = 'SCHEDULED' AND p.isActive = true AND p.startDate > :now) OR "
                    + "(:status = 'EXPIRED' AND p.isActive = true AND p.endDate < :now))")
    Page<Popup> findByStatus(
            @Param("status") String status, @Param("now") LocalDateTime now, Pageable pageable);

    // Buscar com filtro
    @Query(
            "SELECT p FROM Popup p WHERE "
                    + "(:title IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND "
                    + "(:type IS NULL OR p.type = :type) AND "
                    + "(:position IS NULL OR p.position = :position) AND "
                    + "(:isActive IS NULL OR p.isActive = :isActive)")
    Page<Popup> search(
            @Param("title") String title,
            @Param("type") String type,
            @Param("position") String position,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

    // Incrementar contador de exibição
    @Modifying
    @Query("UPDATE Popup p SET p.displayCount = p.displayCount + 1 WHERE p.id = :id")
    void incrementDisplayCount(@Param("id") String id);

    // Buscar ativos para um usuário específico
    @Query(
            "SELECT p FROM Popup p WHERE p.isActive = true AND "
                    + "(p.startDate IS NULL OR p.startDate <= :now) AND "
                    + "(p.endDate IS NULL OR p.endDate >= :now) AND "
                    + "(p.maxDisplay = 0 OR p.displayCount < p.maxDisplay) AND "
                    + "(p.targetRoles IS NULL OR p.targetRoles = '' OR p.targetRoles LIKE CONCAT('%', :role, '%') OR p.targetRoles LIKE '%ALL%') AND "
                    + "(p.targetUsers IS NULL OR p.targetUsers = '' OR p.targetUsers LIKE CONCAT('%', :userId, '%')) "
                    + "ORDER BY p.priority DESC")
    List<Popup> findActivePopupsForUser(
            @Param("now") LocalDateTime now,
            @Param("role") String role,
            @Param("userId") String userId);

    // Deletar expirados
    @Modifying
    @Query("DELETE FROM Popup p WHERE p.endDate IS NOT NULL AND p.endDate < :date")
    void deleteExpired(@Param("date") LocalDateTime date);

    // Desativar expirados
    @Modifying
    @Query(
            "UPDATE Popup p SET p.isActive = false WHERE p.endDate IS NOT NULL AND p.endDate < :date")
    void deactivateExpired(@Param("date") LocalDateTime date);
}
