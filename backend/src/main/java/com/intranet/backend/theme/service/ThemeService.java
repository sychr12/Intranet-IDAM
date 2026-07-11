package com.intranet.backend.theme.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.intranet.backend.theme.dto.ThemeFilterDTO;
import com.intranet.backend.theme.dto.ThemeRequestDTO;
import com.intranet.backend.theme.dto.ThemeResponseDTO;

public interface ThemeService {

    // CRUD
    ThemeResponseDTO create(ThemeRequestDTO dto, String createdBy);

    ThemeResponseDTO update(String id, ThemeRequestDTO dto);

    ThemeResponseDTO getById(String id);

    ThemeResponseDTO getBySlug(String slug);

    Page<ThemeResponseDTO> getAll(Pageable pageable);

    Page<ThemeResponseDTO> filter(ThemeFilterDTO filter, Pageable pageable);

    void delete(String id);

    // Status
    void activate(String id);

    void deactivate(String id);

    void setAsDefault(String id);

    // Buscas especiais
    ThemeResponseDTO getCurrentTheme();

    List<ThemeResponseDTO> getActiveThemes();

    List<ThemeResponseDTO> getUpcomingThemes();

    List<ThemeResponseDTO> getThemesByType(String type);

    // Sistema
    void autoUpdateThemeStatus();

    void applyThemeToFrontend(String themeId);
}
