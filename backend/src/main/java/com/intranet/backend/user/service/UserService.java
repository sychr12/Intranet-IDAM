package com.intranet.backend.user.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.intranet.backend.user.dto.UserFilterDTO;
import com.intranet.backend.user.dto.UserRequestDTO;
import com.intranet.backend.user.dto.UserResponseDTO;
import com.intranet.backend.user.dto.UserUpdateDTO;
import com.intranet.backend.user.model.User;

public interface UserService {
    UserResponseDTO create(UserRequestDTO dto);

    UserResponseDTO update(String id, UserUpdateDTO dto);

    UserResponseDTO getById(String id);

    UserResponseDTO getByUsername(String username);

    UserResponseDTO getByEmail(String email);

    Page<UserResponseDTO> getAll(Pageable pageable);

    Page<UserResponseDTO> filter(UserFilterDTO filter, Pageable pageable);

    void delete(String id);

    void activate(String id);

    void deactivate(String id);

    void changePassword(String id, String newPassword);

    void resetPassword(String id);

    void registerLogin(String username);

    void handleFailedLogin(String username);

    void unlockUser(String id);

    List<UserResponseDTO> getActiveUsers();

    List<UserResponseDTO> getUsersByRole(User.Role role);

    List<UserResponseDTO> getUsersWithFirstAccess();

    long countUsers();

    long countActiveUsers();

    long countByRole(User.Role role);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    User getEntityById(String id);
}
