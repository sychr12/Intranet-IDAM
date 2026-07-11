package com.intranet.backend.popup.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopupFilterDTO {
    private String title;
    private String type;
    private String position;
    private Boolean isActive;
    private String status; // ALL, ACTIVE, INACTIVE, SCHEDULED, EXPIRED
    private LocalDateTime startDateFrom;
    private LocalDateTime startDateTo;
    private LocalDateTime endDateFrom;
    private LocalDateTime endDateTo;
    private String createdBy;
}
