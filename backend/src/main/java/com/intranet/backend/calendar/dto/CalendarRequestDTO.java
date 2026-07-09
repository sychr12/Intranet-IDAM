package com.intranet.backend.calendar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarRequestDTO {

    @NotBlank(message = "País é obrigatório")
    @Pattern(regexp = "^[A-Z]{2}$", message = "País deve estar no formato ISO (ex: BR, US)")
    private String country;

    private Integer year;

    private Integer month;

    private Integer day;

    @Builder.Default
    private Boolean includeHolidays = true;

    @Builder.Default
    private Boolean includeEvents = true;

    @Builder.Default
    private Boolean includeWeekends = true;

    @Builder.Default
    private String language = "pt";

    @Builder.Default
    private Boolean syncFromApi = true;
}