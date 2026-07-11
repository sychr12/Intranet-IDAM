package com.intranet.backend.weather.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastDTO {
    private LocalDateTime dateTime;
    private String dayOfWeek;
    private Double temperature;
    private Double feelsLike;
    private Integer humidity;
    private Double windSpeed;
    private String condition;
    private String description;
    private String icon;
    private String iconUrl;
    private Double rainProbability;
    private Double minTemp;
    private Double maxTemp;
}
