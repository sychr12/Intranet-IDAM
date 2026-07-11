package com.intranet.backend.calendar.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDTO {
    private String id;
    private String name;
    private LocalDate date;
    private String country;
    private String type;
    private String description;
    private Boolean isNational;
    private Boolean isGlobal;
    private String primaryType;
    private String apiId;
    private String formattedDate;
    private String dayOfWeek;
    private Integer daysUntil;
    private Boolean isToday;
    private Boolean isUpcoming;
}
