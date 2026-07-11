package com.intranet.backend.theme.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.intranet.backend.common.dto.ApiResponse;
import com.intranet.backend.common.dto.PaginatedResponse;
import com.intranet.backend.common.util.SecurityUtils;
import com.intranet.backend.theme.dto.ThemeFilterDTO;
import com.intranet.backend.theme.dto.ThemeRequestDTO;
import com.intranet.backend.theme.dto.ThemeResponseDTO;
import com.intranet.backend.theme.service.ThemeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/themes")
@RequiredArgsConstructor
@Slf4j
public class ThemeController {

    private final ThemeService themeService;
    private final SecurityUtils securityUtils;

    // ===== Público - Para usuários autenticados =====

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<ThemeResponseDTO>> getCurrentTheme() {
        log.info("Requisição para tema atual");

        ThemeResponseDTO theme = themeService.getCurrentTheme();

        return ResponseEntity.ok(ApiResponse.success("Tema atual obtido com sucesso", theme));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<ThemeResponseDTO>>> getActiveThemes() {
        log.info("Requisição para temas ativos");

        List<ThemeResponseDTO> themes = themeService.getActiveThemes();

        return ResponseEntity.ok(ApiResponse.success("Temas ativos obtidos com sucesso", themes));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<ThemeResponseDTO>>> getUpcomingThemes() {
        log.info("Requisição para temas futuros");

        List<ThemeResponseDTO> themes = themeService.getUpcomingThemes();

        return ResponseEntity.ok(ApiResponse.success("Temas futuros obtidos com sucesso", themes));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<ThemeResponseDTO>>> getThemesByType(
            @PathVariable String type) {
        log.info("Requisição para temas por tipo: {}", type);

        List<ThemeResponseDTO> themes = themeService.getThemesByType(type);

        return ResponseEntity.ok(ApiResponse.success("Temas por tipo obtidos com sucesso", themes));
    }

    @GetMapping("/slug/{slug}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<ThemeResponseDTO>> getBySlug(@PathVariable String slug) {
        log.info("Requisição para tema por slug: {}", slug);

        ThemeResponseDTO theme = themeService.getBySlug(slug);

        return ResponseEntity.ok(ApiResponse.success("Tema encontrado com sucesso", theme));
    }

    // ===== Admin =====

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThemeResponseDTO>> create(
            @Valid @RequestBody ThemeRequestDTO dto) {
        log.info("Requisição para criar tema: {}", dto.getName());

        String createdBy = securityUtils.getCurrentUsername();
        ThemeResponseDTO response = themeService.create(dto, createdBy);

        return ResponseEntity.ok(ApiResponse.success("Tema criado com sucesso", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThemeResponseDTO>> update(
            @PathVariable String id, @Valid @RequestBody ThemeRequestDTO dto) {
        log.info("Requisição para atualizar tema: {}", id);

        ThemeResponseDTO response = themeService.update(id, dto);

        return ResponseEntity.ok(ApiResponse.success("Tema atualizado com sucesso", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<ThemeResponseDTO>>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para listar todos os temas");

        Page<ThemeResponseDTO> page = themeService.getAll(pageable);
        PaginatedResponse<ThemeResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(ApiResponse.success("Temas listados com sucesso", response));
    }

    @PostMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<ThemeResponseDTO>>> filter(
            @RequestBody ThemeFilterDTO filter, @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para filtrar temas");

        Page<ThemeResponseDTO> page = themeService.filter(filter, pageable);
        PaginatedResponse<ThemeResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(ApiResponse.success("Temas filtrados com sucesso", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThemeResponseDTO>> getById(@PathVariable String id) {
        log.info("Requisição para buscar tema: {}", id);

        ThemeResponseDTO theme = themeService.getById(id);

        return ResponseEntity.ok(ApiResponse.success("Tema encontrado com sucesso", theme));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable String id) {
        log.info("Requisição para ativar tema: {}", id);

        themeService.activate(id);

        return ResponseEntity.ok(ApiResponse.success("Tema ativado com sucesso"));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable String id) {
        log.info("Requisição para desativar tema: {}", id);

        themeService.deactivate(id);

        return ResponseEntity.ok(ApiResponse.success("Tema desativado com sucesso"));
    }

    @PatchMapping("/{id}/default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> setAsDefault(@PathVariable String id) {
        log.info("Requisição para definir tema como padrão: {}", id);

        themeService.setAsDefault(id);

        return ResponseEntity.ok(ApiResponse.success("Tema definido como padrão com sucesso"));
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> applyTheme(@PathVariable String id) {
        log.info("Requisição para aplicar tema: {}", id);

        themeService.applyThemeToFrontend(id);

        return ResponseEntity.ok(ApiResponse.success("Tema aplicado com sucesso"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        log.info("Requisição para deletar tema: {}", id);

        themeService.delete(id);

        return ResponseEntity.ok(ApiResponse.success("Tema deletado com sucesso"));
    }

    // ===== Health =====

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Theme Service is UP", "OK"));
    }
}
