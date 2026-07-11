package com.intranet.backend.weather.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherApiResponse {

    private Location location;
    private Current current;
    private Forecast forecast;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Location {
        private String name;
        private String country;
        private String region;

        @JsonProperty("localtime")
        private String localTime;

        @JsonProperty("timezone_id")
        private String timezone;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Current {
        @JsonProperty("temp_c")
        private Double temperature;

        @JsonProperty("feelslike_c")
        private Double feelsLike;

        private Integer humidity;

        @JsonProperty("wind_kph")
        private Double windSpeed;

        @JsonProperty("wind_degree")
        private Integer windDegree;

        @JsonProperty("wind_dir")
        private String windDirection;

        @JsonProperty("pressure_mb")
        private Double pressure;

        private Integer visibility;
        private Double uv;
        private Condition condition;

        @JsonProperty("last_updated")
        private String lastUpdated;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Condition {
        private String text;
        private String icon;
        private Integer code;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Forecast {
        @JsonProperty("forecastday")
        private List<ForecastDay> forecastDays;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ForecastDay {
        @JsonProperty("date")
        private String date;

        private Day day;
        private Astro astro;
        private List<Hour> hour;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Day {
        @JsonProperty("maxtemp_c")
        private Double maxTemp;

        @JsonProperty("mintemp_c")
        private Double minTemp;

        @JsonProperty("avgtemp_c")
        private Double avgTemp;

        @JsonProperty("maxwind_kph")
        private Double maxWind;

        @JsonProperty("totalprecip_mm")
        private Double totalPrecip;

        @JsonProperty("avgvis_km")
        private Double avgVis;

        @JsonProperty("avghumidity")
        private Integer avgHumidity;

        @JsonProperty("daily_chance_of_rain")
        private Integer dailyChanceOfRain;

        @JsonProperty("daily_chance_of_snow")
        private Integer dailyChanceOfSnow;

        private Condition condition;

        @JsonProperty("uv")
        private Double uv;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Astro {
        @JsonProperty("sunrise")
        private String sunrise;

        @JsonProperty("sunset")
        private String sunset;

        @JsonProperty("moonrise")
        private String moonrise;

        @JsonProperty("moonset")
        private String moonset;

        @JsonProperty("moon_phase")
        private String moonPhase;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Hour {
        @JsonProperty("time")
        private String time;

        @JsonProperty("temp_c")
        private Double temperature;

        @JsonProperty("feelslike_c")
        private Double feelsLike;

        private Integer humidity;

        @JsonProperty("wind_kph")
        private Double windSpeed;

        @JsonProperty("chance_of_rain")
        private Integer chanceOfRain;

        private Condition condition;
    }
}
