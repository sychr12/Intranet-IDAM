package com.intranet.backend.popup.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.intranet.backend.popup.dto.PopupFilterDTO;
import com.intranet.backend.popup.dto.PopupRequestDTO;
import com.intranet.backend.popup.dto.PopupResponseDTO;

public interface PopupService {

    // Criar
    PopupResponseDTO create(PopupRequestDTO dto, String createdBy);

    // Atualizar
    PopupResponseDTO update(String id, PopupRequestDTO dto);

    // Buscar
    PopupResponseDTO getById(String id);

    Page<PopupResponseDTO> getAll(Pageable pageable);

    Page<PopupResponseDTO> filter(PopupFilterDTO filter, Pageable pageable);

    // Ativos
    List<PopupResponseDTO> getActivePopups();

    List<PopupResponseDTO> getActivePopupsForUser(String userId, String role);

    // Status
    void activate(String id);

    void deactivate(String id);

    // Deletar
    void delete(String id);

    // Contador
    void incrementDisplayCount(String id);

    // Limpeza
    void cleanExpiredPopups();
}
