package com.intranet.backend.notification.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationFilterDTO {
    private String userId;
    private String type;
    private String category;
    private Boolean isRead;
    private Boolean isSystem;
    private String search;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
