package com.intranet.backend.popup.controller;

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
import com.intranet.backend.popup.dto.PopupFilterDTO;
import com.intranet.backend.popup.dto.PopupRequestDTO;
import com.intranet.backend.popup.dto.PopupResponseDTO;
import com.intranet.backend.popup.service.PopupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/popups")
@RequiredArgsConstructor
@Slf4j
public class PopupController {

    private final PopupService popupService;
    private final SecurityUtils securityUtils;

    // ===== Público - Para usuários autenticados =====

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<PopupResponseDTO>>> getActivePopups(
            @RequestParam(required = false) String userId) {
        log.info("Requisição para popups ativos");

        String currentUserId = userId != null ? userId : securityUtils.getCurrentUsername();
        String role = getCurrentUserRole();

        List<PopupResponseDTO> popups = popupService.getActivePopupsForUser(currentUserId, role);

        // Incrementar contador de exibição
        popups.forEach(popup -> popupService.incrementDisplayCount(popup.getId()));

        return ResponseEntity.ok(ApiResponse.success("Popups ativos obtidos com sucesso", popups));
    }

    @GetMapping("/active/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<PopupResponseDTO>>> getAllActivePopups() {
        log.info("Requisição para todos os popups ativos");

        List<PopupResponseDTO> popups = popupService.getActivePopups();

        return ResponseEntity.ok(ApiResponse.success("Popups ativos obtidos com sucesso", popups));
    }

    // ===== Admin =====

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PopupResponseDTO>> create(
            @Valid @RequestBody PopupRequestDTO dto) {
        log.info("Requisição para criar popup: {}", dto.getTitle());

        String createdBy = securityUtils.getCurrentUsername();
        PopupResponseDTO response = popupService.create(dto, createdBy);

        return ResponseEntity.ok(ApiResponse.success("Popup criado com sucesso", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PopupResponseDTO>> update(
            @PathVariable String id, @Valid @RequestBody PopupRequestDTO dto) {
        log.info("Requisição para atualizar popup: {}", id);

        PopupResponseDTO response = popupService.update(id, dto);

        return ResponseEntity.ok(ApiResponse.success("Popup atualizado com sucesso", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<PopupResponseDTO>>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para listar todos os popups");

        Page<PopupResponseDTO> page = popupService.getAll(pageable);
        PaginatedResponse<PopupResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(ApiResponse.success("Popups listados com sucesso", response));
    }

    @PostMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<PopupResponseDTO>>> filter(
            @RequestBody PopupFilterDTO filter, @PageableDefault(size = 20) Pageable pageable) {
        log.info("Requisição para filtrar popups");

        Page<PopupResponseDTO> page = popupService.filter(filter, pageable);
        PaginatedResponse<PopupResponseDTO> response = PaginatedResponse.fromPage(page);

        return ResponseEntity.ok(ApiResponse.success("Popups filtrados com sucesso", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PopupResponseDTO>> getById(@PathVariable String id) {
        log.info("Requisição para buscar popup: {}", id);

        PopupResponseDTO response = popupService.getById(id);

        return ResponseEntity.ok(ApiResponse.success("Popup encontrado com sucesso", response));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable String id) {
        log.info("Requisição para ativar popup: {}", id);

        popupService.activate(id);

        return ResponseEntity.ok(ApiResponse.success("Popup ativado com sucesso"));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable String id) {
        log.info("Requisição para desativar popup: {}", id);

        popupService.deactivate(id);

        return ResponseEntity.ok(ApiResponse.success("Popup desativado com sucesso"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        log.info("Requisição para deletar popup: {}", id);

        popupService.delete(id);

        return ResponseEntity.ok(ApiResponse.success("Popup deletado com sucesso"));
    }

    // ===== Health =====

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Popup Service is UP", "OK"));
    }

    // Métodos auxiliares

    private String getCurrentUserRole() {
        // Implementação simples - pegar role do usuário atual
        // Em produção, use o SecurityContextHolder
        return "ADMIN"; // Placeholder
    }
}
