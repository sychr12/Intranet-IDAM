package com.intranet.backend.weather.client;

import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.intranet.backend.common.exception.ExternalApiException;
import com.intranet.backend.config.properties.WeatherProperties;
import com.intranet.backend.weather.dto.WeatherApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.util.retry.Retry;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeatherClient {

    private final WebClient webClient;
    private final WeatherProperties weatherProperties;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final Duration RETRY_BACKOFF = Duration.ofSeconds(2);

    /** Busca dados climáticos atuais para uma cidade */
    public WeatherApiResponse getCurrentWeather(String city) {
        log.info("Buscando clima atual para: {}", city);

        try {
            WeatherApiResponse response =
                    webClient
                            .get()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .scheme("https")
                                                    .host(
                                                            weatherProperties
                                                                    .getBaseUrl()
                                                                    .replace("https://", ""))
                                                    .path("/current.json")
                                                    .queryParam(
                                                            "key", weatherProperties.getApiKey())
                                                    .queryParam("q", city)
                                                    .queryParam("aqi", "no")
                                                    .queryParam("lang", weatherProperties.getLang())
                                                    .build())
                            .retrieve()
                            .bodyToMono(WeatherApiResponse.class)
                            .retryWhen(
                                    Retry.backoff(MAX_RETRY_ATTEMPTS, RETRY_BACKOFF)
                                            .filter(
                                                    throwable ->
                                                            throwable
                                                                            instanceof
                                                                            WebClientResponseException
                                                                                    .ServiceUnavailable
                                                                    || throwable
                                                                            instanceof
                                                                            WebClientResponseException
                                                                                    .TooManyRequests)
                                            .onRetryExhaustedThrow(
                                                    (retryBackoffSpec, retrySignal) -> {
                                                        throw new ExternalApiException(
                                                                "WeatherAPI",
                                                                "API de clima indisponível após múltiplas tentativas: "
                                                                        + city);
                                                    }))
                            .block();

            if (response == null || response.getLocation() == null) {
                throw new ExternalApiException(
                        "WeatherAPI", "Resposta vazia da API de clima para: " + city);
            }

            log.info("Dados climáticos obtidos com sucesso para: {}", city);
            return response;

        } catch (WebClientResponseException.NotFound e) {
            log.error("Cidade não encontrada: {}", city);
            throw new ExternalApiException("WeatherAPI", "Cidade não encontrada: " + city, 404);
        } catch (WebClientResponseException.TooManyRequests e) {
            log.error("Limite de requisições excedido para API de clima");
            throw new ExternalApiException(
                    "WeatherAPI",
                    "Limite de requisições excedido. Tente novamente mais tarde.",
                    429);
        } catch (WebClientResponseException.Unauthorized e) {
            log.error("API Key inválida");
            throw new ExternalApiException(
                    "WeatherAPI", "API Key inválida. Verifique suas credenciais.", 401);
        } catch (WebClientResponseException e) {
            log.error("Erro ao consumir API de clima: {}", e.getMessage());
            throw new ExternalApiException(
                    "WeatherAPI",
                    "Erro ao buscar dados climáticos: " + e.getMessage(),
                    e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Erro inesperado ao consumir API de clima: {}", e.getMessage());
            throw new ExternalApiException(
                    "WeatherAPI", "Erro inesperado ao buscar dados climáticos: " + e.getMessage());
        }
    }

    /** Busca previsão do tempo para uma cidade */
    public WeatherApiResponse getForecastWeather(String city, int days) {
        log.info("Buscando previsão do tempo para: {} ({} dias)", city, days);

        try {
            WeatherApiResponse response =
                    webClient
                            .get()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .scheme("https")
                                                    .host(
                                                            weatherProperties
                                                                    .getBaseUrl()
                                                                    .replace("https://", ""))
                                                    .path("/forecast.json")
                                                    .queryParam(
                                                            "key", weatherProperties.getApiKey())
                                                    .queryParam("q", city)
                                                    .queryParam("days", days)
                                                    .queryParam("aqi", "no")
                                                    .queryParam("alerts", "no")
                                                    .queryParam("lang", weatherProperties.getLang())
                                                    .build())
                            .retrieve()
                            .bodyToMono(WeatherApiResponse.class)
                            .retryWhen(
                                    Retry.backoff(MAX_RETRY_ATTEMPTS, RETRY_BACKOFF)
                                            .filter(
                                                    throwable ->
                                                            throwable
                                                                            instanceof
                                                                            WebClientResponseException
                                                                                    .ServiceUnavailable
                                                                    || throwable
                                                                            instanceof
                                                                            WebClientResponseException
                                                                                    .TooManyRequests)
                                            .onRetryExhaustedThrow(
                                                    (retryBackoffSpec, retrySignal) -> {
                                                        throw new ExternalApiException(
                                                                "WeatherAPI",
                                                                "API de clima indisponível após múltiplas tentativas: "
                                                                        + city);
                                                    }))
                            .block();

            if (response == null || response.getLocation() == null) {
                throw new ExternalApiException(
                        "WeatherAPI", "Resposta vazia da API de previsão para: " + city);
            }

            log.info("Previsão do tempo obtida com sucesso para: {}", city);
            return response;

        } catch (WebClientResponseException.NotFound e) {
            log.error("Cidade não encontrada para previsão: {}", city);
            throw new ExternalApiException("WeatherAPI", "Cidade não encontrada: " + city, 404);
        } catch (WebClientResponseException.TooManyRequests e) {
            log.error("Limite de requisições excedido para API de clima");
            throw new ExternalApiException(
                    "WeatherAPI",
                    "Limite de requisições excedido. Tente novamente mais tarde.",
                    429);
        } catch (WebClientResponseException.Unauthorized e) {
            log.error("API Key inválida");
            throw new ExternalApiException(
                    "WeatherAPI", "API Key inválida. Verifique suas credenciais.", 401);
        } catch (WebClientResponseException e) {
            log.error("Erro ao consumir API de previsão: {}", e.getMessage());
            throw new ExternalApiException(
                    "WeatherAPI",
                    "Erro ao buscar previsão do tempo: " + e.getMessage(),
                    e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Erro inesperado ao consumir API de previsão: {}", e.getMessage());
            throw new ExternalApiException(
                    "WeatherAPI", "Erro inesperado ao buscar previsão do tempo: " + e.getMessage());
        }
    }

    /** Busca dados climáticos completos (atual + previsão) */
    public WeatherApiResponse getCompleteWeather(String city, int days) {
        log.info("Buscando dados climáticos completos para: {}", city);
        return getForecastWeather(city, days);
    }
}
