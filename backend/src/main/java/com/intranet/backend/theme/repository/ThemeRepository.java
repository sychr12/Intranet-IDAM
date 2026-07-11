package com.intranet.backend.theme.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.intranet.backend.theme.model.Theme;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, String> {

    Optional<Theme> findBySlug(String slug);

    List<Theme> findByIsActiveTrue();

    List<Theme> findByIsDefaultTrue();

    @Query(
            "SELECT t FROM Theme t WHERE t.isActive = true AND t.startDate <= :date AND t.endDate >= :date")
    List<Theme> findActiveThemesForDate(@Param("date") LocalDate date);

    @Query(
            "SELECT t FROM Theme t WHERE t.isActive = true AND t.startDate <= :date AND t.endDate >= :date ORDER BY t.priority DESC")
    List<Theme> findCurrentThemes(@Param("date") LocalDate date);

    @Query(
            "SELECT t FROM Theme t WHERE t.isActive = true AND t.startDate > :date ORDER BY t.startDate")
    List<Theme> findUpcomingThemes(@Param("date") LocalDate date);

    @Query("SELECT t FROM Theme t WHERE t.isActive = true AND t.endDate < :date")
    List<Theme> findExpiredThemes(@Param("date") LocalDate date);

    @Query("SELECT t FROM Theme t WHERE t.type = :type AND t.isActive = true")
    List<Theme> findActiveByType(@Param("type") Theme.ThemeType type);

    @Query(
            "SELECT t FROM Theme t WHERE "
                    + "(:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND "
                    + "(:type IS NULL OR t.type = :type) AND "
                    + "(:status IS NULL OR t.status = :status) AND "
                    + "(:isActive IS NULL OR t.isActive = :isActive) AND "
                    + "(:isDefault IS NULL OR t.isDefault = :isDefault)")
    Page<Theme> search(
            @Param("name") String name,
            @Param("type") Theme.ThemeType type,
            @Param("status") Theme.ThemeStatus status,
            @Param("isActive") Boolean isActive,
            @Param("isDefault") Boolean isDefault,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Theme t SET t.isDefault = false WHERE t.isDefault = true")
    void clearDefaultTheme();

    @Query(
            "SELECT COUNT(t) FROM Theme t WHERE t.isActive = true AND t.startDate <= :date AND t.endDate >= :date")
    long countCurrentThemes(@Param("date") LocalDate date);

    @Modifying
    @Query("UPDATE Theme t SET t.status = 'EXPIRED' WHERE t.isActive = true AND t.endDate < :date")
    void expireOldThemes(@Param("date") LocalDate date);

    @Modifying
    @Query(
            "UPDATE Theme t SET t.status = 'ACTIVE', t.isActive = true WHERE t.isActive = false AND t.startDate <= :date AND t.endDate >= :date")
    void activateScheduledThemes(@Param("date") LocalDate date);
}
