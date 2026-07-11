package com.intranet.backend.theme.mapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Component;

import com.intranet.backend.theme.dto.ThemeRequestDTO;
import com.intranet.backend.theme.dto.ThemeResponseDTO;
import com.intranet.backend.theme.model.Theme;

@Component
public class ThemeMapper {

    public Theme toEntity(ThemeRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return Theme.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .displayName(dto.getDisplayName())
                .description(dto.getDescription())
                .icon(dto.getIcon())
                .imageUrl(dto.getImageUrl())
                .type(
                        dto.getType() != null
                                ? Theme.ThemeType.valueOf(dto.getType())
                                : Theme.ThemeType.CUSTOM)
                .status(
                        dto.getStatus() != null
                                ? Theme.ThemeStatus.valueOf(dto.getStatus())
                                : Theme.ThemeStatus.DRAFT)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : false)
                .isDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .primaryColor(dto.getPrimaryColor())
                .secondaryColor(dto.getSecondaryColor())
                .backgroundColor(dto.getBackgroundColor())
                .textColor(dto.getTextColor())
                .accentColor(dto.getAccentColor())
                .fontFamily(dto.getFontFamily())
                .customCss(dto.getCustomCss())
                .customJs(dto.getCustomJs())
                .config(dto.getConfig())
                .priority(dto.getPriority() != null ? dto.getPriority() : 0)
                .build();
    }

    public ThemeResponseDTO toDTO(Theme theme) {
        if (theme == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        boolean isCurrent =
                theme.getIsActive()
                        && (theme.getStartDate() == null || !theme.getStartDate().isAfter(today))
                        && (theme.getEndDate() == null || !theme.getEndDate().isBefore(today));

        long daysUntilStart =
                theme.getStartDate() != null
                        ? ChronoUnit.DAYS.between(today, theme.getStartDate())
                        : 0;
        long daysUntilEnd =
                theme.getEndDate() != null ? ChronoUnit.DAYS.between(today, theme.getEndDate()) : 0;

        return ThemeResponseDTO.builder()
                .id(theme.getId())
                .name(theme.getName())
                .slug(theme.getSlug())
                .displayName(theme.getDisplayName())
                .description(theme.getDescription())
                .icon(theme.getIcon())
                .imageUrl(theme.getImageUrl())
                .type(theme.getType().name())
                .status(theme.getStatus().name())
                .isActive(theme.getIsActive())
                .isDefault(theme.getIsDefault())
                .startDate(theme.getStartDate())
                .endDate(theme.getEndDate())
                .primaryColor(theme.getPrimaryColor())
                .secondaryColor(theme.getSecondaryColor())
                .backgroundColor(theme.getBackgroundColor())
                .textColor(theme.getTextColor())
                .accentColor(theme.getAccentColor())
                .fontFamily(theme.getFontFamily())
                .customCss(theme.getCustomCss())
                .customJs(theme.getCustomJs())
                .config(theme.getConfig())
                .priority(theme.getPriority())
                .createdBy(theme.getCreatedBy())
                .createdAt(theme.getCreatedAt())
                .updatedAt(theme.getUpdatedAt())
                .isCurrent(isCurrent)
                .daysUntilStart((int) daysUntilStart)
                .daysUntilEnd((int) daysUntilEnd)
                .timeRemaining(formatTimeRemaining(daysUntilEnd))
                .build();
    }

    private String formatTimeRemaining(long days) {
        if (days < 0) return "Expirado";
        if (days == 0) return "Termina hoje";
        if (days == 1) return "Termina amanhã";
        if (days < 7) return days + " dias restantes";
        if (days < 30) return (days / 7) + " semanas restantes";
        if (days < 365) return (days / 30) + " meses restantes";
        return (days / 365) + " anos restantes";
    }
}
