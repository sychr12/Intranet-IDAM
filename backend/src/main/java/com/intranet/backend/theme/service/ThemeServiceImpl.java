package com.intranet.backend.theme.service;

import java.time.LocalDate;
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
import com.intranet.backend.theme.dto.ThemeFilterDTO;
import com.intranet.backend.theme.dto.ThemeRequestDTO;
import com.intranet.backend.theme.dto.ThemeResponseDTO;
import com.intranet.backend.theme.mapper.ThemeMapper;
import com.intranet.backend.theme.model.Theme;
import com.intranet.backend.theme.repository.ThemeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ThemeServiceImpl implements ThemeService {

    private final ThemeRepository themeRepository;
    private final ThemeMapper themeMapper;

    @Override
    public ThemeResponseDTO create(ThemeRequestDTO dto, String createdBy) {
        log.info("Criando novo tema: {}", dto.getName());

        // Verificar slug único
        if (themeRepository.findBySlug(dto.getSlug()).isPresent()) {
            throw new BusinessException("Slug já está em uso: " + dto.getSlug());
        }

        // Se for default, remover default dos outros
        if (dto.getIsDefault() != null && dto.getIsDefault()) {
            themeRepository.clearDefaultTheme();
        }

        Theme theme = themeMapper.toEntity(dto);
        theme.setCreatedBy(createdBy);
        theme.setStatus(
                dto.getStatus() != null
                        ? Theme.ThemeStatus.valueOf(dto.getStatus())
                        : Theme.ThemeStatus.DRAFT);

        Theme saved = themeRepository.save(theme);
        log.info("Tema criado com sucesso: {}", saved.getId());

        return themeMapper.toDTO(saved);
    }

    @Override
    @CacheEvict(
            value = {"themes", "currentTheme", "activeThemes"},
            allEntries = true)
    public ThemeResponseDTO update(String id, ThemeRequestDTO dto) {
        log.info("Atualizando tema: {}", id);

        Theme theme =
                themeRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Tema não encontrado"));

        // Verificar slug único (se mudou)
        if (!theme.getSlug().equals(dto.getSlug())
                && themeRepository.findBySlug(dto.getSlug()).isPresent()) {
            throw new BusinessException("Slug já está em uso: " + dto.getSlug());
        }

        // Se for default, remover default dos outros
        if (dto.getIsDefault() != null && dto.getIsDefault() && !theme.getIsDefault()) {
            themeRepository.clearDefaultTheme();
        }

        theme.setName(dto.getName());
        theme.setSlug(dto.getSlug());
        theme.setDisplayName(dto.getDisplayName());
        theme.setDescription(dto.getDescription());
        theme.setIcon(dto.getIcon());
        theme.setImageUrl(dto.getImageUrl());
        theme.setType(Theme.ThemeType.valueOf(dto.getType()));
        theme.setStatus(Theme.ThemeStatus.valueOf(dto.getStatus()));
        theme.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : false);
        theme.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);
        theme.setStartDate(dto.getStartDate());
        theme.setEndDate(dto.getEndDate());
        theme.setPrimaryColor(dto.getPrimaryColor());
        theme.setSecondaryColor(dto.getSecondaryColor());
        theme.setBackgroundColor(dto.getBackgroundColor());
        theme.setTextColor(dto.getTextColor());
        theme.setAccentColor(dto.getAccentColor());
        theme.setFontFamily(dto.getFontFamily());
        theme.setCustomCss(dto.getCustomCss());
        theme.setCustomJs(dto.getCustomJs());
        theme.setConfig(dto.getConfig());
        theme.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);

        Theme updated = themeRepository.save(theme);
        log.info("Tema atualizado com sucesso: {}", id);

        return themeMapper.toDTO(updated);
    }

    @Override
    public ThemeResponseDTO getById(String id) {
        log.info("Buscando tema por ID: {}", id);

        Theme theme =
                themeRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Tema não encontrado"));

        return themeMapper.toDTO(theme);
    }

    @Override
    public ThemeResponseDTO getBySlug(String slug) {
        log.info("Buscando tema por slug: {}", slug);

        Theme theme =
                themeRepository
                        .findBySlug(slug)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Tema não encontrado com slug: " + slug));

        return themeMapper.toDTO(theme);
    }

    @Override
    public Page<ThemeResponseDTO> getAll(Pageable pageable) {
        log.info("Buscando todos os temas");

        return themeRepository.findAll(pageable).map(themeMapper::toDTO);
    }

    @Override
    public Page<ThemeResponseDTO> filter(ThemeFilterDTO filter, Pageable pageable) {
        log.info("Filtrando temas");

        Theme.ThemeType type =
                filter.getType() != null ? Theme.ThemeType.valueOf(filter.getType()) : null;
        Theme.ThemeStatus status =
                filter.getStatus() != null ? Theme.ThemeStatus.valueOf(filter.getStatus()) : null;

        return themeRepository
                .search(
                        filter.getName(),
                        type,
                        status,
                        filter.getIsActive(),
                        filter.getIsDefault(),
                        pageable)
                .map(themeMapper::toDTO);
    }

    @Override
    @CacheEvict(
            value = {"themes", "currentTheme", "activeThemes"},
            allEntries = true)
    public void delete(String id) {
        log.info("Deletando tema: {}", id);

        Theme theme =
                themeRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Tema não encontrado"));

        if (theme.getIsDefault()) {
            throw new BusinessException("Não é possível deletar o tema padrão");
        }

        themeRepository.deleteById(id);
    }

    @Override
    @CacheEvict(
            value = {"themes", "currentTheme", "activeThemes"},
            allEntries = true)
    public void activate(String id) {
        log.info("Ativando tema: {}", id);

        Theme theme =
                themeRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Tema não encontrado"));

        theme.setIsActive(true);
        theme.setStatus(Theme.ThemeStatus.ACTIVE);
        themeRepository.save(theme);
    }

    @Override
    @CacheEvict(
            value = {"themes", "currentTheme", "activeThemes"},
            allEntries = true)
    public void deactivate(String id) {
        log.info("Desativando tema: {}", id);

        Theme theme =
                themeRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Tema não encontrado"));

        if (theme.getIsDefault()) {
            throw new BusinessException("Não é possível desativar o tema padrão");
        }

        theme.setIsActive(false);
        theme.setStatus(Theme.ThemeStatus.INACTIVE);
        themeRepository.save(theme);
    }

    @Override
    @CacheEvict(
            value = {"themes", "currentTheme", "activeThemes"},
            allEntries = true)
    public void setAsDefault(String id) {
        log.info("Definindo tema como padrão: {}", id);

        Theme theme =
                themeRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Tema não encontrado"));

        themeRepository.clearDefaultTheme();
        theme.setIsDefault(true);
        themeRepository.save(theme);
    }

    @Override
    @Cacheable(value = "currentTheme")
    public ThemeResponseDTO getCurrentTheme() {
        log.info("Buscando tema atual");

        LocalDate today = LocalDate.now();
        List<Theme> currentThemes = themeRepository.findCurrentThemes(today);

        // Se tiver temas ativos, pegar o de maior prioridade
        if (!currentThemes.isEmpty()) {
            Theme current = currentThemes.get(0);
            log.info("Tema atual encontrado: {}", current.getName());
            return themeMapper.toDTO(current);
        }

        // Se não tiver tema ativo, buscar o padrão
        List<Theme> defaultThemes = themeRepository.findByIsDefaultTrue();
        if (!defaultThemes.isEmpty()) {
            log.info("Usando tema padrão: {}", defaultThemes.get(0).getName());
            return themeMapper.toDTO(defaultThemes.get(0));
        }

        // Se não tiver nenhum, criar tema padrão
        log.warn("Nenhum tema encontrado, criando tema padrão");
        return createDefaultTheme();
    }

    @Override
    @Cacheable(value = "activeThemes")
    public List<ThemeResponseDTO> getActiveThemes() {
        log.info("Buscando temas ativos");

        return themeRepository.findByIsActiveTrue().stream()
                .map(themeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ThemeResponseDTO> getUpcomingThemes() {
        log.info("Buscando temas futuros");

        return themeRepository.findUpcomingThemes(LocalDate.now()).stream()
                .map(themeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ThemeResponseDTO> getThemesByType(String type) {
        log.info("Buscando temas por tipo: {}", type);

        Theme.ThemeType themeType = Theme.ThemeType.valueOf(type);
        return themeRepository.findActiveByType(themeType).stream()
                .map(themeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Scheduled(cron = "0 0 0 * * ?") // Executa todos os dias à meia-noite
    public void autoUpdateThemeStatus() {
        log.info("Atualizando status dos temas automaticamente");

        LocalDate today = LocalDate.now();

        // Ativar temas agendados
        themeRepository.activateScheduledThemes(today);

        // Expirar temas antigos
        themeRepository.expireOldThemes(today);

        log.info("Atualização automática de temas concluída");
    }

    @Override
    public void applyThemeToFrontend(String themeId) {
        log.info("Aplicando tema ao frontend: {}", themeId);

        Theme theme =
                themeRepository
                        .findById(themeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Tema não encontrado"));

        // Incrementar contador de exibição se tiver
        // Aqui você pode implementar a lógica para enviar o tema para o frontend
        // via WebSocket, SSE ou simplesmente retornar no endpoint

        log.info("Tema {} aplicado ao frontend", theme.getName());
    }

    // Método auxiliar para criar tema padrão
    private ThemeResponseDTO createDefaultTheme() {
        Theme defaultTheme =
                Theme.builder()
                        .name("Default")
                        .slug("default")
                        .displayName("Tema Padrão")
                        .description("Tema padrão da intranet")
                        .type(Theme.ThemeType.CUSTOM)
                        .status(Theme.ThemeStatus.ACTIVE)
                        .isActive(true)
                        .isDefault(true)
                        .primaryColor("#3B82F6")
                        .secondaryColor("#10B981")
                        .backgroundColor("#FFFFFF")
                        .textColor("#1F2937")
                        .accentColor("#8B5CF6")
                        .priority(0)
                        .build();

        Theme saved = themeRepository.save(defaultTheme);
        return themeMapper.toDTO(saved);
    }
}
