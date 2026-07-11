package com.intranet.backend.calendar.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarResponseDTO {
    private String country;
    private String countryName;
    private Integer year;
    private Integer month;
    private LocalDate currentDate;
    private LocalDateTime generatedAt;
    private String language;
    private Boolean fromCache;
    private Integer totalDays;
    private Integer totalWorkingDays;
    private Integer totalHolidays;
    private Integer totalEvents;
    private Integer weekendsCount;
    private List<HolidayDTO> holidays;
    private List<EventDTO> events;
    private List<CalendarDayDTO> calendarDays;
    private CalendarStatisticsDTO statistics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarDayDTO {
        private LocalDate date;
        private String dayOfWeek;
        private String dayOfWeekShort;
        private Boolean isWeekend;
        private Boolean isHoliday;
        private Boolean isWorkingDay;
        private String holidayName;
        private List<HolidayDTO> holidays;
        private List<EventDTO> events;
        private String formattedDate;
        private Integer dayOfMonth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarStatisticsDTO {
        private Integer totalDays;
        private Integer workingDays;
        private Integer holidays;
        private Integer weekends;
        private Integer events;
        private Double averageEventsPerDay;
        private String mostActiveDay;
        private String monthWithMostHolidays;
        private List<HolidayStatisticsDTO> holidayDistribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HolidayStatisticsDTO {
        private String type;
        private Long count;
        private String description;
    }
}
