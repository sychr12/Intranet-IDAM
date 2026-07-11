package com.intranet.backend.calendar.client;

import java.time.Duration;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.intranet.backend.calendar.config.CalendarConfig;
import com.intranet.backend.calendar.dto.CalendarApiResponse;
import com.intranet.backend.common.exception.ExternalApiException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.util.retry.Retry;

@Component
@RequiredArgsConstructor
@Slf4j
public class CalendarClient {

    private final WebClient webClient;
    private final CalendarConfig calendarConfig;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final Duration RETRY_BACKOFF = Duration.ofSeconds(2);

    /** Busca feriados de um país específico para um determinado ano */
    public CalendarApiResponse getHolidays(String country, int year) {
        log.info("Buscando feriados para: {} no ano {}", country, year);

        try {
            CalendarApiResponse response =
                    webClient
                            .get()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .path("/holidays")
                                                    .queryParam(
                                                            "api_key", calendarConfig.getApiKey())
                                                    .queryParam("country", country)
                                                    .queryParam("year", year)
                                                    .queryParam(
                                                            "language",
                                                            calendarConfig.getDefaultLanguage())
                                                    .build())
                            .retrieve()
                            .onStatus(
                                    HttpStatusCode::is4xxClientError,
                                    clientResponse -> {
                                        log.error(
                                                "Erro 4xx ao buscar feriados: {}",
                                                clientResponse.statusCode());
                                        return clientResponse
                                                .bodyToMono(String.class)
                                                .flatMap(
                                                        error -> {
                                                            log.error(
                                                                    "Detalhes do erro: {}", error);
                                                            return reactor.core.publisher.Mono
                                                                    .error(
                                                                            new ExternalApiException(
                                                                                    "Erro ao buscar feriados: "
                                                                                            + error));
                                                        });
                                    })
                            .bodyToMono(CalendarApiResponse.class)
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
                                                                "API de calendário indisponível após múltiplas tentativas");
                                                    }))
                            .block();

            if (response == null || response.getResponse() == null) {
                throw new ExternalApiException("Resposta vazia da API de calendário");
            }

            log.info(
                    "Feriados obtidos com sucesso: {} feriados encontrados",
                    response.getResponse().getHolidays() != null
                            ? response.getResponse().getHolidays().size()
                            : 0);

            return response;

        } catch (WebClientResponseException.NotFound e) {
            log.error("Recurso não encontrado: {}", e.getMessage());
            throw new ExternalApiException(
                    "Dados de calendário não encontrados para o país: " + country);
        } catch (WebClientResponseException.TooManyRequests e) {
            log.error("Limite de requisições excedido para API de calendário");
            throw new ExternalApiException(
                    "Limite de requisições excedido. Tente novamente mais tarde.");
        } catch (WebClientResponseException.Unauthorized e) {
            log.error("API Key inválida ou não autorizada");
            throw new ExternalApiException("API Key inválida. Verifique suas credenciais.");
        } catch (WebClientResponseException e) {
            log.error("Erro ao consumir API de calendário: {}", e.getMessage());
            throw new ExternalApiException("Erro ao buscar dados de calendário: " + e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao consumir API de calendário: {}", e.getMessage());
            throw new ExternalApiException("Erro inesperado ao buscar dados de calendário");
        }
    }

    /** Busca feriados de um país para um mês específico */
    public CalendarApiResponse getHolidaysByMonth(String country, int year, int month) {
        log.info("Buscando feriados para: {} no mês {}/{}", country, month, year);

        try {
            CalendarApiResponse response =
                    webClient
                            .get()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .path("/holidays")
                                                    .queryParam(
                                                            "api_key", calendarConfig.getApiKey())
                                                    .queryParam("country", country)
                                                    .queryParam("year", year)
                                                    .queryParam("month", month)
                                                    .queryParam(
                                                            "language",
                                                            calendarConfig.getDefaultLanguage())
                                                    .build())
                            .retrieve()
                            .bodyToMono(CalendarApiResponse.class)
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
                                                                "API de calendário indisponível após múltiplas tentativas");
                                                    }))
                            .block();

            if (response == null || response.getResponse() == null) {
                throw new ExternalApiException("Resposta vazia da API de calendário");
            }

            return response;

        } catch (Exception e) {
            log.error("Erro ao buscar feriados por mês: {}", e.getMessage());
            throw new ExternalApiException("Erro ao buscar feriados por mês: " + e.getMessage());
        }
    }

    /** Busca feriados por data específica */
    public CalendarApiResponse getHolidaysByDate(String country, int year, int month, int day) {
        log.info("Buscando feriados para: {} na data {}/{}/{}", country, day, month, year);

        try {
            CalendarApiResponse response =
                    webClient
                            .get()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .path("/holidays")
                                                    .queryParam(
                                                            "api_key", calendarConfig.getApiKey())
                                                    .queryParam("country", country)
                                                    .queryParam("year", year)
                                                    .queryParam("month", month)
                                                    .queryParam("day", day)
                                                    .queryParam(
                                                            "language",
                                                            calendarConfig.getDefaultLanguage())
                                                    .build())
                            .retrieve()
                            .bodyToMono(CalendarApiResponse.class)
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
                                                                "API de calendário indisponível após múltiplas tentativas");
                                                    }))
                            .block();

            if (response == null || response.getResponse() == null) {
                throw new ExternalApiException("Resposta vazia da API de calendário");
            }

            return response;

        } catch (Exception e) {
            log.error("Erro ao buscar feriados por data: {}", e.getMessage());
            throw new ExternalApiException("Erro ao buscar feriados por data: " + e.getMessage());
        }
    }
}
