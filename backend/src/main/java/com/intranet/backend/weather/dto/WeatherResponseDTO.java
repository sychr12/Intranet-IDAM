package com.intranet.backend.weather.dto;

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
public class WeatherResponseDTO {
    private String city;
    private String country;
    private String region;
    private String timezone;
    private LocalDateTime localTime;
    private CurrentWeatherDTO current;
    private List<ForecastDTO> forecast;
    private LocalDateTime lastUpdated;
    private Boolean fromCache;
}
