package com.intranet.backend.user.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.intranet.backend.user.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Page<User> findByAtivoTrue(Pageable pageable);

    Page<User> findByRole(User.Role role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.ativo = true")
    List<User> findActiveByRole(@Param("role") User.Role role);

    @Query(
            "SELECT u FROM User u WHERE "
                    + "(:nome IS NULL OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) AND "
                    + "(:username IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND "
                    + "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND "
                    + "(:role IS NULL OR u.role = :role) AND "
                    + "(:ativo IS NULL OR u.ativo = :ativo)")
    Page<User> search(
            @Param("nome") String nome,
            @Param("username") String username,
            @Param("email") String email,
            @Param("role") User.Role role,
            @Param("ativo") Boolean ativo,
            Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.ultimoAcesso = :data WHERE u.id = :id")
    void updateUltimoAcesso(@Param("id") String id, @Param("data") LocalDateTime data);

    @Modifying
    @Query("UPDATE User u SET u.tentativasLogin = u.tentativasLogin + 1 WHERE u.id = :id")
    void incrementTentativasLogin(@Param("id") String id);

    @Modifying
    @Query("UPDATE User u SET u.tentativasLogin = 0, u.bloqueadoAte = NULL WHERE u.id = :id")
    void resetTentativasLogin(@Param("id") String id);

    @Modifying
    @Query("UPDATE User u SET u.bloqueadoAte = :bloqueadoAte WHERE u.id = :id")
    void bloquearUsuario(@Param("id") String id, @Param("bloqueadoAte") LocalDateTime bloqueadoAte);

    @Query("SELECT u FROM User u WHERE u.primeiroAcesso = true AND u.ativo = true")
    List<User> findUsersWithFirstAccess();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") User.Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.ativo = true")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.ultimoAcesso >= :data")
    long countActiveLastDays(@Param("data") LocalDateTime data);
}
