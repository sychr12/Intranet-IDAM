package com.intranet.backend.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentWeatherDTO {
    private Double temperature;
    private Double feelsLike;
    private Integer humidity;
    private Double windSpeed;
    private Integer windDegree;
    private String windDirection;
    private Double pressure;
    private Integer visibility;
    private Double uvIndex;
    private String condition;
    private String description;
    private String icon;
    private String iconUrl;
}
