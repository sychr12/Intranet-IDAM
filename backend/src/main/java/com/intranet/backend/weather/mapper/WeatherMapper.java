package com.intranet.backend.weather.mapper;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.intranet.backend.weather.dto.CurrentWeatherDTO;
import com.intranet.backend.weather.dto.ForecastDTO;
import com.intranet.backend.weather.dto.WeatherApiResponse;
import com.intranet.backend.weather.dto.WeatherResponseDTO;

@Component
public class WeatherMapper {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final String ICON_BASE_URL = "https:";

    public WeatherResponseDTO toResponseDTO(WeatherApiResponse response, boolean fromCache) {
        if (response == null || response.getLocation() == null) {
            return null;
        }

        WeatherApiResponse.Location location = response.getLocation();
        WeatherApiResponse.Current current = response.getCurrent();

        // Mapear clima atual
        CurrentWeatherDTO currentWeather = toCurrentWeatherDTO(current);

        // Mapear previsão
        List<ForecastDTO> forecastList = new ArrayList<>();
        if (response.getForecast() != null && response.getForecast().getForecastDays() != null) {
            forecastList =
                    response.getForecast().getForecastDays().stream()
                            .flatMap(
                                    forecastDay -> {
                                        List<ForecastDTO> dayForecasts = new ArrayList<>();

                                        // Adicionar resumo do dia
                                        if (forecastDay.getDay() != null) {
                                            ForecastDTO dailyForecast =
                                                    toDailyForecastDTO(
                                                            forecastDay.getDate(),
                                                            forecastDay.getDay(),
                                                            forecastDay.getAstro());
                                            dayForecasts.add(dailyForecast);
                                        }

                                        // Adicionar previsões por hora (apenas algumas horas
                                        // principais)
                                        if (forecastDay.getHour() != null
                                                && !forecastDay.getHour().isEmpty()) {
                                            List<ForecastDTO> hourForecasts =
                                                    forecastDay.getHour().stream()
                                                            .filter(
                                                                    hour -> {
                                                                        String hourTime =
                                                                                hour.getTime()
                                                                                        .substring(
                                                                                                11,
                                                                                                13);
                                                                        int hourInt =
                                                                                Integer.parseInt(
                                                                                        hourTime);
                                                                        return hourInt % 3 == 0
                                                                                && hourInt >= 6
                                                                                && hourInt <= 21;
                                                                    })
                                                            .map(this::toHourForecastDTO)
                                                            .collect(Collectors.toList());
                                            dayForecasts.addAll(hourForecasts);
                                        }

                                        return dayForecasts.stream();
                                    })
                            .collect(Collectors.toList());
        }

        // Determinar horário local
        LocalDateTime localTime = null;
        if (location.getLocalTime() != null) {
            try {
                localTime = LocalDateTime.parse(location.getLocalTime(), DATE_FORMATTER);
            } catch (Exception e) {
                localTime = LocalDateTime.now();
            }
        }

        return WeatherResponseDTO.builder()
                .city(location.getName())
                .country(location.getCountry())
                .region(location.getRegion())
                .timezone(location.getTimezone())
                .localTime(localTime)
                .current(currentWeather)
                .forecast(forecastList)
                .lastUpdated(LocalDateTime.now())
                .fromCache(fromCache)
                .build();
    }

    private CurrentWeatherDTO toCurrentWeatherDTO(WeatherApiResponse.Current current) {
        if (current == null) {
            return null;
        }

        return CurrentWeatherDTO.builder()
                .temperature(current.getTemperature())
                .feelsLike(current.getFeelsLike())
                .humidity(current.getHumidity())
                .windSpeed(current.getWindSpeed())
                .windDegree(current.getWindDegree())
                .windDirection(current.getWindDirection())
                .pressure(current.getPressure())
                .visibility(current.getVisibility())
                .uvIndex(current.getUv())
                .condition(current.getCondition() != null ? current.getCondition().getText() : null)
                .description(
                        current.getCondition() != null ? current.getCondition().getText() : null)
                .icon(current.getCondition() != null ? current.getCondition().getIcon() : null)
                .iconUrl(
                        current.getCondition() != null && current.getCondition().getIcon() != null
                                ? ICON_BASE_URL + current.getCondition().getIcon()
                                : null)
                .build();
    }

    private ForecastDTO toDailyForecastDTO(
            String date, WeatherApiResponse.Day day, WeatherApiResponse.Astro astro) {
        if (day == null) {
            return null;
        }

        LocalDateTime dateTime = LocalDateTime.parse(date + " 12:00", DATE_FORMATTER);

        return ForecastDTO.builder()
                .dateTime(dateTime)
                .dayOfWeek(getDayOfWeek(dateTime))
                .temperature(day.getAvgTemp())
                .feelsLike(day.getAvgTemp())
                .minTemp(day.getMinTemp())
                .maxTemp(day.getMaxTemp())
                .humidity(day.getAvgHumidity())
                .windSpeed(day.getMaxWind())
                .condition(day.getCondition() != null ? day.getCondition().getText() : null)
                .description(day.getCondition() != null ? day.getCondition().getText() : null)
                .icon(day.getCondition() != null ? day.getCondition().getIcon() : null)
                .iconUrl(
                        day.getCondition() != null && day.getCondition().getIcon() != null
                                ? ICON_BASE_URL + day.getCondition().getIcon()
                                : null)
                .rainProbability(
                        day.getDailyChanceOfRain() != null
                                ? day.getDailyChanceOfRain().doubleValue()
                                : 0.0)
                .build();
    }

    private ForecastDTO toHourForecastDTO(WeatherApiResponse.Hour hour) {
        if (hour == null || hour.getTime() == null) {
            return null;
        }

        LocalDateTime dateTime = LocalDateTime.parse(hour.getTime(), DATE_FORMATTER);

        return ForecastDTO.builder()
                .dateTime(dateTime)
                .dayOfWeek(getDayOfWeek(dateTime))
                .temperature(hour.getTemperature())
                .feelsLike(hour.getFeelsLike())
                .humidity(hour.getHumidity())
                .windSpeed(hour.getWindSpeed())
                .condition(hour.getCondition() != null ? hour.getCondition().getText() : null)
                .description(hour.getCondition() != null ? hour.getCondition().getText() : null)
                .icon(hour.getCondition() != null ? hour.getCondition().getIcon() : null)
                .iconUrl(
                        hour.getCondition() != null && hour.getCondition().getIcon() != null
                                ? ICON_BASE_URL + hour.getCondition().getIcon()
                                : null)
                .rainProbability(
                        hour.getChanceOfRain() != null ? hour.getChanceOfRain().doubleValue() : 0.0)
                .build();
    }

    private String getDayOfWeek(LocalDateTime dateTime) {
        return switch (dateTime.getDayOfWeek()) {
            case MONDAY -> "Segunda";
            case TUESDAY -> "Terça";
            case WEDNESDAY -> "Quarta";
            case THURSDAY -> "Quinta";
            case FRIDAY -> "Sexta";
            case SATURDAY -> "Sábado";
            case SUNDAY -> "Domingo";
        };
    }
}
