package com.intranet.backend.calendar.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

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
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}
