package com.intranet.backend.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private String id;
    private String title;
    private String description;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String location;
    private String type;
    private String priority;
    private String status;
    private String color;
    private Boolean isAllDay;
    private Boolean isActive;
    private String createdBy;
    private String createdById;
    private String duration;
    private String formattedStart;
    private String formattedEnd;
    private Boolean isPast;
    private Boolean isToday;
    private Boolean isUpcoming;
}