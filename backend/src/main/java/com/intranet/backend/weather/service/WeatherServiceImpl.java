package com.intranet.backend.weather.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.intranet.backend.weather.client.WeatherClient;
import com.intranet.backend.weather.dto.WeatherApiResponse;
import com.intranet.backend.weather.dto.WeatherRequestDTO;
import com.intranet.backend.weather.dto.WeatherResponseDTO;
import com.intranet.backend.weather.mapper.WeatherMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherServiceImpl implements WeatherService {

    private final WeatherClient weatherClient;
    private final WeatherMapper weatherMapper;

    @Override
    @Cacheable(
            value = "weather",
            key = "#request.city + '_' + #request.country + '_current'",
            unless = "#result == null")
    public WeatherResponseDTO getCurrentWeather(WeatherRequestDTO request) {
        log.info("Buscando clima atual para: {}", request.getCity());

        String location = buildLocation(request);
        WeatherApiResponse response = weatherClient.getCurrentWeather(location);

        return weatherMapper.toResponseDTO(response, false);
    }

    @Override
    @Cacheable(
            value = "weatherForecast",
            key = "#request.city + '_' + #request.country + '_' + #request.days",
            unless = "#result == null")
    public WeatherResponseDTO getForecastWeather(WeatherRequestDTO request) {
        log.info(
                "Buscando previsão do tempo para: {} ({} dias)",
                request.getCity(),
                request.getDays());

        String location = buildLocation(request);
        int days = request.getDays() != null ? request.getDays() : 3;
        WeatherApiResponse response = weatherClient.getForecastWeather(location, days);

        return weatherMapper.toResponseDTO(response, false);
    }

    @Override
    @Cacheable(
            value = "weatherComplete",
            key = "#request.city + '_' + #request.country + '_' + #request.days",
            unless = "#result == null")
    public WeatherResponseDTO getCompleteWeather(WeatherRequestDTO request) {
        log.info("Buscando dados climáticos completos para: {}", request.getCity());

        String location = buildLocation(request);
        int days = request.getDays() != null ? request.getDays() : 3;
        WeatherApiResponse response = weatherClient.getCompleteWeather(location, days);

        return weatherMapper.toResponseDTO(response, false);
    }

    @Override
    @CacheEvict(
            value = {"weather", "weatherForecast", "weatherComplete"},
            allEntries = true)
    public void clearCache() {
        log.info("Cache de clima limpo");
    }

    private String buildLocation(WeatherRequestDTO request) {
        String city = request.getCity();
        String country = request.getCountry();

        if (country != null && !country.isEmpty()) {
            return city + "," + country;
        }
        return city;
    }
}
