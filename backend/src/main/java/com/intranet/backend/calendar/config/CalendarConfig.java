package com.intranet.backend.calendar.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "calendar.api")
public class CalendarConfig {
    private String baseUrl;
    private String apiKey;
    private String defaultCountry;
    private String defaultLanguage;

    @Bean
    public WebClient calendarWebClient() {
        return WebClient.builder().baseUrl(baseUrl).build();
    }
}
