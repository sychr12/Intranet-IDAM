package com.intranet.backend.weather.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherRequestDTO {

    @NotBlank(message = "Cidade é obrigatória")
    private String city;

    private String country;

    @Builder.Default private String units = "metric";

    @Builder.Default private String lang = "pt";

    @Builder.Default private Integer days = 3; // Previsão para 3 dias
}
