package com.intranet.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "calendar.api")
public class CalendarConfig {
    private String baseUrl;
    private String apiKey;
    private String defaultCountry;
    private String defaultLanguage;
}