package com.intranet.backend.popup.service;

import java.time.LocalDateTime;
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
import com.intranet.backend.popup.dto.PopupFilterDTO;
import com.intranet.backend.popup.dto.PopupRequestDTO;
import com.intranet.backend.popup.dto.PopupResponseDTO;
import com.intranet.backend.popup.mapper.PopupMapper;
import com.intranet.backend.popup.model.Popup;
import com.intranet.backend.popup.repository.PopupRepository;
import com.intranet.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PopupServiceImpl implements PopupService {

    private final PopupRepository popupRepository;
    private final UserRepository userRepository;
    private final PopupMapper popupMapper;

    @Override
    public PopupResponseDTO create(PopupRequestDTO dto, String createdBy) {
        log.info("Criando novo popup: {}", dto.getTitle());

        validatePopup(dto);

        Popup popup = popupMapper.toEntity(dto);
        popup.setCreatedBy(createdBy);
        popup.setIsSystem(false);

        Popup saved = popupRepository.save(popup);
        log.info("Popup criado com sucesso: {}", saved.getId());

        return popupMapper.toDTO(saved);
    }

    @Override
    @CacheEvict(
            value = {"popups", "activePopups"},
            allEntries = true)
    public PopupResponseDTO update(String id, PopupRequestDTO dto) {
        log.info("Atualizando popup: {}", id);

        Popup popup =
                popupRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Popup não encontrado"));

        validatePopup(dto);

        popup.setTitle(dto.getTitle());
        popup.setMessage(dto.getMessage());
        popup.setImageUrl(dto.getImageUrl());
        popup.setLink(dto.getLink());
        popup.setLinkText(dto.getLinkText());
        popup.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        popup.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        popup.setStartDate(dto.getStartDate());
        popup.setEndDate(dto.getEndDate());
        popup.setMaxDisplay(dto.getMaxDisplay() != null ? dto.getMaxDisplay() : 0);
        popup.setDismissible(dto.getDismissible() != null ? dto.getDismissible() : true);
        popup.setType(dto.getType() != null ? dto.getType() : "INFO");
        popup.setPosition(dto.getPosition() != null ? dto.getPosition() : "CENTER");
        popup.setSize(dto.getSize() != null ? dto.getSize() : "MEDIUM");
        popup.setBackgroundColor(dto.getBackgroundColor());
        popup.setTextColor(dto.getTextColor());
        popup.setTargetRoles(dto.getTargetRoles());
        popup.setTargetUsers(dto.getTargetUsers());

        Popup updated = popupRepository.save(popup);
        log.info("Popup atualizado com sucesso: {}", id);

        return popupMapper.toDTO(updated);
    }

    @Override
    public PopupResponseDTO getById(String id) {
        log.info("Buscando popup por ID: {}", id);

        Popup popup =
                popupRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Popup não encontrado"));

        return popupMapper.toDTO(popup);
    }

    @Override
    @Cacheable(value = "popups", key = "#pageable.pageNumber")
    public Page<PopupResponseDTO> getAll(Pageable pageable) {
        log.info("Buscando todos os popups");

        return popupRepository.findAll(pageable).map(popupMapper::toDTO);
    }

    @Override
    public Page<PopupResponseDTO> filter(PopupFilterDTO filter, Pageable pageable) {
        log.info("Filtrando popups");

        if (filter.getStatus() != null) {
            return popupRepository
                    .findByStatus(filter.getStatus(), LocalDateTime.now(), pageable)
                    .map(popupMapper::toDTO);
        }

        return popupRepository
                .search(
                        filter.getTitle(),
                        filter.getType(),
                        filter.getPosition(),
                        filter.getIsActive(),
                        pageable)
                .map(popupMapper::toDTO);
    }

    @Override
    @Cacheable(value = "activePopups")
    public List<PopupResponseDTO> getActivePopups() {
        log.info("Buscando popups ativos");

        return popupRepository.findActivePopups(LocalDateTime.now()).stream()
                .map(popupMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PopupResponseDTO> getActivePopupsForUser(String userId, String role) {
        log.info("Buscando popups ativos para usuário: {} com role: {}", userId, role);

        List<Popup> popups =
                popupRepository.findActivePopupsForUser(LocalDateTime.now(), role, userId);

        return popups.stream().map(popupMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @CacheEvict(
            value = {"popups", "activePopups"},
            allEntries = true)
    public void activate(String id) {
        log.info("Ativando popup: {}", id);

        Popup popup =
                popupRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Popup não encontrado"));

        popup.setIsActive(true);
        popupRepository.save(popup);
    }

    @Override
    @CacheEvict(
            value = {"popups", "activePopups"},
            allEntries = true)
    public void deactivate(String id) {
        log.info("Desativando popup: {}", id);

        Popup popup =
                popupRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Popup não encontrado"));

        popup.setIsActive(false);
        popupRepository.save(popup);
    }

    @Override
    @CacheEvict(
            value = {"popups", "activePopups"},
            allEntries = true)
    public void delete(String id) {
        log.info("Deletando popup: {}", id);

        if (!popupRepository.existsById(id)) {
            throw new ResourceNotFoundException("Popup não encontrado");
        }

        popupRepository.deleteById(id);
    }

    @Override
    public void incrementDisplayCount(String id) {
        log.debug("Incrementando contador de exibição do popup: {}", id);

        popupRepository.incrementDisplayCount(id);
    }

    @Override
    @Scheduled(cron = "0 0 2 * * ?") // Executa todos os dias às 2h
    public void cleanExpiredPopups() {
        log.info("Limpando popups expirados");

        LocalDateTime now = LocalDateTime.now();

        // Desativar popups expirados
        popupRepository.deactivateExpired(now);

        // Deletar popups expirados (opcional - mantém histórico)
        // popupRepository.deleteExpired(now.minusDays(30)); // Deletar após 30 dias

        log.info("Limpeza de popups expirados concluída");
    }

    // Métodos auxiliares

    private void validatePopup(PopupRequestDTO dto) {
        if (dto.getStartDate() != null && dto.getEndDate() != null) {
            if (dto.getStartDate().isAfter(dto.getEndDate())) {
                throw new BusinessException(
                        "Data de início não pode ser posterior à data de término");
            }
        }

        if (dto.getType() != null) {
            try {
                Popup.PopupType.valueOf(dto.getType());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Tipo de popup inválido: " + dto.getType());
            }
        }

        if (dto.getPosition() != null) {
            try {
                Popup.PopupPosition.valueOf(dto.getPosition());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Posição de popup inválida: " + dto.getPosition());
            }
        }

        if (dto.getSize() != null) {
            try {
                Popup.PopupSize.valueOf(dto.getSize());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Tamanho de popup inválido: " + dto.getSize());
            }
        }
    }
}
