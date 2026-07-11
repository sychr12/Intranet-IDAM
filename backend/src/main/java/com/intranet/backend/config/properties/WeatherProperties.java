package com.intranet.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "weather.api")
public class WeatherProperties {
    private String baseUrl = "https://api.weatherapi.com/v1";
    private String apiKey;
    private String lang = "pt";
}
