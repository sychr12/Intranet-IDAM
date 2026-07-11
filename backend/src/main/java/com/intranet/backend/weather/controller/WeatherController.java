package com.intranet.backend.weather.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.intranet.backend.common.dto.ApiResponse;
import com.intranet.backend.weather.dto.WeatherRequestDTO;
import com.intranet.backend.weather.dto.WeatherResponseDTO;
import com.intranet.backend.weather.service.WeatherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
@Slf4j
public class WeatherController {

    private final WeatherService weatherService;

    // ===== Usuários Autenticados =====

    @PostMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<WeatherResponseDTO>> getCurrentWeather(
            @Valid @RequestBody WeatherRequestDTO request) {
        log.info("Requisição para clima atual: {}", request.getCity());

        WeatherResponseDTO weather = weatherService.getCurrentWeather(request);

        return ResponseEntity.ok(
                ApiResponse.success("Dados climáticos obtidos com sucesso", weather));
    }

    @PostMapping("/forecast")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<WeatherResponseDTO>> getForecastWeather(
            @Valid @RequestBody WeatherRequestDTO request) {
        log.info(
                "Requisição para previsão do tempo: {} ({} dias)",
                request.getCity(),
                request.getDays());

        WeatherResponseDTO weather = weatherService.getForecastWeather(request);

        return ResponseEntity.ok(
                ApiResponse.success("Previsão do tempo obtida com sucesso", weather));
    }

    @PostMapping("/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<WeatherResponseDTO>> getCompleteWeather(
            @Valid @RequestBody WeatherRequestDTO request) {
        log.info("Requisição para dados climáticos completos: {}", request.getCity());

        WeatherResponseDTO weather = weatherService.getCompleteWeather(request);

        return ResponseEntity.ok(
                ApiResponse.success("Dados climáticos completos obtidos com sucesso", weather));
    }

    @GetMapping("/current/{city}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<WeatherResponseDTO>> getCurrentWeatherByCity(
            @PathVariable String city, @RequestParam(required = false) String country) {
        log.info("Requisição para clima atual da cidade: {}", city);

        WeatherRequestDTO request = WeatherRequestDTO.builder().city(city).country(country).build();

        WeatherResponseDTO weather = weatherService.getCurrentWeather(request);

        return ResponseEntity.ok(
                ApiResponse.success("Dados climáticos obtidos com sucesso", weather));
    }

    @GetMapping("/forecast/{city}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<WeatherResponseDTO>> getForecastByCity(
            @PathVariable String city,
            @RequestParam(required = false) String country,
            @RequestParam(defaultValue = "3") Integer days) {
        log.info("Requisição para previsão da cidade: {} ({} dias)", city, days);

        WeatherRequestDTO request =
                WeatherRequestDTO.builder().city(city).country(country).days(days).build();

        WeatherResponseDTO weather = weatherService.getForecastWeather(request);

        return ResponseEntity.ok(
                ApiResponse.success("Previsão do tempo obtida com sucesso", weather));
    }

    // ===== Admin =====

    @DeleteMapping("/cache")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> clearCache() {
        log.info("Requisição para limpar cache do serviço de clima");

        weatherService.clearCache();

        return ResponseEntity.ok(ApiResponse.success("Cache de clima limpo com sucesso"));
    }

    // ===== Health =====

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        log.info("Health check do serviço de clima");

        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Weather Service");

        return ResponseEntity.ok(ApiResponse.success("Weather Service está operacional", health));
    }
}
