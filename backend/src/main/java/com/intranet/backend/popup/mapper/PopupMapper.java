package com.intranet.backend.popup.mapper;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.intranet.backend.popup.dto.PopupRequestDTO;
import com.intranet.backend.popup.dto.PopupResponseDTO;
import com.intranet.backend.popup.model.Popup;

@Component
public class PopupMapper {

    public Popup toEntity(PopupRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return Popup.builder()
                .title(dto.getTitle())
                .message(dto.getMessage())
                .imageUrl(dto.getImageUrl())
                .link(dto.getLink())
                .linkText(dto.getLinkText())
                .priority(dto.getPriority() != null ? dto.getPriority() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .maxDisplay(dto.getMaxDisplay() != null ? dto.getMaxDisplay() : 0)
                .dismissible(dto.getDismissible() != null ? dto.getDismissible() : true)
                .type(dto.getType() != null ? dto.getType() : "INFO")
                .position(dto.getPosition() != null ? dto.getPosition() : "CENTER")
                .size(dto.getSize() != null ? dto.getSize() : "MEDIUM")
                .backgroundColor(dto.getBackgroundColor())
                .textColor(dto.getTextColor())
                .targetRoles(dto.getTargetRoles())
                .targetUsers(dto.getTargetUsers())
                .isSystem(false)
                .displayCount(0)
                .build();
    }

    public PopupResponseDTO toDTO(Popup popup) {
        if (popup == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        String status;

        if (!popup.getIsActive()) {
            status = "INACTIVE";
        } else if (popup.getStartDate() != null && popup.getStartDate().isAfter(now)) {
            status = "SCHEDULED";
        } else if (popup.getEndDate() != null && popup.getEndDate().isBefore(now)) {
            status = "EXPIRED";
        } else {
            status = "ACTIVE";
        }

        boolean isVisible =
                popup.getIsActive()
                        && (popup.getStartDate() == null || !popup.getStartDate().isAfter(now))
                        && (popup.getEndDate() == null || !popup.getEndDate().isBefore(now))
                        && (popup.getMaxDisplay() == 0
                                || popup.getDisplayCount() < popup.getMaxDisplay());

        return PopupResponseDTO.builder()
                .id(popup.getId())
                .title(popup.getTitle())
                .message(popup.getMessage())
                .imageUrl(popup.getImageUrl())
                .link(popup.getLink())
                .linkText(popup.getLinkText())
                .priority(popup.getPriority())
                .isActive(popup.getIsActive())
                .startDate(popup.getStartDate())
                .endDate(popup.getEndDate())
                .displayCount(popup.getDisplayCount())
                .maxDisplay(popup.getMaxDisplay())
                .dismissible(popup.getDismissible())
                .type(popup.getType())
                .position(popup.getPosition())
                .size(popup.getSize())
                .backgroundColor(popup.getBackgroundColor())
                .textColor(popup.getTextColor())
                .targetRoles(popup.getTargetRoles())
                .targetUsers(popup.getTargetUsers())
                .isSystem(popup.getIsSystem())
                .createdBy(popup.getCreatedBy())
                .createdAt(popup.getCreatedAt())
                .updatedAt(popup.getUpdatedAt())
                .status(status)
                .isVisible(isVisible)
                .build();
    }
}
