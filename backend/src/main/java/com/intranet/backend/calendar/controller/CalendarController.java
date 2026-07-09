package com.intranet.backend.calendar.controller;

import com.intranet.backend.calendar.dto.CalendarRequestDTO;
import com.intranet.backend.calendar.dto.CalendarResponseDTO;
import com.intranet.backend.calendar.dto.EventDTO;
import com.intranet.backend.calendar.dto.HolidayDTO;
import com.intranet.backend.calendar.service.CalendarService;
import com.intranet.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Slf4j
public class CalendarController {

    private final CalendarService calendarService;

    @PostMapping("/data")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<CalendarResponseDTO>> getCalendarData(
            @Valid @RequestBody CalendarRequestDTO request) {
        log.info("Requisição para dados do calendário: {} - {}/{}", 
                request.getCountry(), request.getYear(), request.getMonth());

        CalendarResponseDTO response = calendarService.getCalendarData(request);

        return ResponseEntity.ok(ApiResponse.success("Dados do calendário obtidos com sucesso", response));
    }

    @GetMapping("/holidays/{country}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getHolidaysByCountryAndYear(
            @PathVariable String country,
            @RequestParam(defaultValue = "0") int year) {
        log.info("Requisição para feriados do país: {} no ano {}", country, year);

        int searchYear = year > 0 ? year : LocalDate.now().getYear();
        List<HolidayDTO> holidays = calendarService.getHolidaysByCountryAndYear(country, searchYear);

        return ResponseEntity.ok(ApiResponse.success("Feriados obtidos com sucesso", holidays));
    }

    @GetMapping("/holidays/date")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getHolidaysForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "BR") String country) {
        log.info("Requisição para feriados na data: {} no país {}", date, country);

        List<HolidayDTO> holidays = calendarService.getHolidaysForDate(date, country);

        return ResponseEntity.ok(ApiResponse.success("Feriados obtidos com sucesso", holidays));
    }

    @GetMapping("/holidays/month")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getHolidaysForMonth(
            @RequestParam String country,
            @RequestParam int year,
            @RequestParam int month) {
        log.info("Requisição para feriados do mês {}/{} no país {}", month, year, country);

        List<HolidayDTO> holidays = calendarService.getHolidaysForMonth(country, year, month);

        return ResponseEntity.ok(ApiResponse.success("Feriados obtidos com sucesso", holidays));
    }

    @PostMapping("/holidays")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HolidayDTO>> createHoliday(
            @Valid @RequestBody HolidayDTO holidayDTO) {
        log.info("Requisição para criar feriado: {}", holidayDTO.getName());

        HolidayDTO created = calendarService.createHoliday(holidayDTO);

        return ResponseEntity.ok(ApiResponse.success("Feriado criado com sucesso", created));
    }

    @PutMapping("/holidays/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HolidayDTO>> updateHoliday(
            @PathVariable String id,
            @Valid @RequestBody HolidayDTO holidayDTO) {
        log.info("Requisição para atualizar feriado: {}", id);

        HolidayDTO updated = calendarService.updateHoliday(id, holidayDTO);

        return ResponseEntity.ok(ApiResponse.success("Feriado atualizado com sucesso", updated));
    }

    @DeleteMapping("/holidays/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable String id) {
        log.info("Requisição para deletar feriado: {}", id);

        calendarService.deleteHoliday(id);

        return ResponseEntity.ok(ApiResponse.success("Feriado deletado com sucesso"));
    }

    @GetMapping("/events/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getUpcomingEvents(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Requisição para eventos futuros (limite: {})", limit);

        List<EventDTO> events = calendarService.getUpcomingEvents(limit);

        return ResponseEntity.ok(ApiResponse.success("Eventos futuros obtidos com sucesso", events));
    }

    @GetMapping("/events/date")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Requisição para eventos na data: {}", date);

        List<EventDTO> events = calendarService.getEventsByDate(date);

        return ResponseEntity.ok(ApiResponse.success("Eventos obtidos com sucesso", events));
    }

    @GetMapping("/events/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        log.info("Requisição para eventos entre {} e {}", start, end);

        List<EventDTO> events = calendarService.getEventsBetweenDates(start, end);

        return ResponseEntity.ok(ApiResponse.success("Eventos obtidos com sucesso", events));
    }

    @PostMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<EventDTO>> createEvent(
            @Valid @RequestBody EventDTO eventDTO) {
        log.info("Requisição para criar evento: {}", eventDTO.getTitle());

        EventDTO created = calendarService.createEvent(eventDTO);

        return ResponseEntity.ok(ApiResponse.success("Evento criado com sucesso", created));
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<EventDTO>> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventDTO eventDTO) {
        log.info("Requisição para atualizar evento: {}", id);

        EventDTO updated = calendarService.updateEvent(id, eventDTO);

        return ResponseEntity.ok(ApiResponse.success("Evento atualizado com sucesso", updated));
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable String id) {
        log.info("Requisição para deletar evento: {}", id);

        calendarService.deleteEvent(id);

        return ResponseEntity.ok(ApiResponse.success("Evento deletado com sucesso"));
    }

    @PostMapping("/sync/{country}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> syncHolidays(
            @PathVariable String country,
            @RequestParam(defaultValue = "0") int year) {
        log.info("Requisição para sincronizar feriados: {} no ano {}", country, year);

        int syncYear = year > 0 ? year : LocalDate.now().getYear();
        calendarService.syncHolidaysFromApi(country, syncYear);

        return ResponseEntity.ok(ApiResponse.success("Feriados sincronizados com sucesso"));
    }

    @GetMapping("/check-holiday")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPORTE')")
    public ResponseEntity<ApiResponse<Boolean>> checkHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "BR") String country) {
        log.info("Requisição para verificar feriado em: {} no país {}", date, country);

        boolean isHoliday = calendarService.isHoliday(date, country);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Data %s %s feriado", date, isHoliday ? "é" : "não é"), 
                isHoliday));
    }

    @GetMapping("/statistics/{country}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CalendarResponseDTO.CalendarStatisticsDTO>> getStatistics(
            @PathVariable String country,
            @RequestParam(defaultValue = "0") int year) {
        log.info("Requisição para estatísticas: {} no ano {}", country, year);

        int statsYear = year > 0 ? year : LocalDate.now().getYear();
        var statistics = calendarService.getStatistics(country, statsYear);

        return ResponseEntity.ok(ApiResponse.success("Estatísticas obtidas com sucesso", statistics));
    }
}