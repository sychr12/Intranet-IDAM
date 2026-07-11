package com.intranet.backend.weather.service;

import com.intranet.backend.weather.dto.WeatherRequestDTO;
import com.intranet.backend.weather.dto.WeatherResponseDTO;

public interface WeatherService {

    WeatherResponseDTO getCurrentWeather(WeatherRequestDTO request);

    WeatherResponseDTO getForecastWeather(WeatherRequestDTO request);

    WeatherResponseDTO getCompleteWeather(WeatherRequestDTO request);

    void clearCache();
}
