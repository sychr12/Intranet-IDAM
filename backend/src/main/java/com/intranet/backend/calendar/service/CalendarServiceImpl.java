package com.intranet.backend.calendar.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.intranet.backend.calendar.client.CalendarClient;
import com.intranet.backend.calendar.dto.CalendarApiResponse;
import com.intranet.backend.calendar.dto.CalendarRequestDTO;
import com.intranet.backend.calendar.dto.CalendarResponseDTO;
import com.intranet.backend.calendar.dto.EventDTO;
import com.intranet.backend.calendar.dto.HolidayDTO;
import com.intranet.backend.calendar.mapper.EventMapper;
import com.intranet.backend.calendar.mapper.HolidayMapper;
import com.intranet.backend.calendar.model.Event;
import com.intranet.backend.calendar.model.Holiday;
import com.intranet.backend.calendar.repository.EventRepository;
import com.intranet.backend.calendar.repository.HolidayRepository;
import com.intranet.backend.common.exception.BusinessException;
import com.intranet.backend.common.exception.ExternalApiException;
import com.intranet.backend.common.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CalendarServiceImpl implements CalendarService {

    private final HolidayRepository holidayRepository;
    private final EventRepository eventRepository;
    private final HolidayMapper holidayMapper;
    private final EventMapper eventMapper;
    private final CalendarClient calendarClient;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Cacheable(
            value = "calendarData",
            key =
                    "#request.country + '_' + #request.year + '_' + #request.month + '_' + #request.language")
    public CalendarResponseDTO getCalendarData(CalendarRequestDTO request) {
        log.info(
                "Obtendo dados do calendário para: {} no ano {}/{}",
                request.getCountry(),
                request.getYear(),
                request.getMonth());

        int year = request.getYear() != null ? request.getYear() : LocalDate.now().getYear();
        int month =
                request.getMonth() != null ? request.getMonth() : LocalDate.now().getMonthValue();
        String country = request.getCountry().toUpperCase();

        // Sincronizar feriados da API se necessário
        if (request.getSyncFromApi()) {
            syncHolidaysFromApi(country, year);
        }

        // Buscar feriados do banco de dados
        List<Holiday> holidays =
                holidayRepository.findByCountryAndYearAndMonth(country, year, month);

        // Buscar eventos
        LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endOfMonth =
                startOfMonth
                        .withDayOfMonth(YearMonth.of(year, month).lengthOfMonth())
                        .withHour(23)
                        .withMinute(59)
                        .withSecond(59);

        List<Event> events = eventRepository.findEventsBetweenDates(startOfMonth, endOfMonth);

        // Construir calendário
        return buildCalendarResponse(country, year, month, holidays, events, request);
    }

    @Override
    public void syncHolidaysFromApi(String country, int year) {
        log.info("Sincronizando feriados da API para: {} no ano {}", country, year);

        try {
            CalendarApiResponse response = calendarClient.getHolidays(country, year);

            if (response != null
                    && response.getResponse() != null
                    && response.getResponse().getHolidays() != null) {

                // Remover feriados antigos do ano
                holidayRepository.deleteByCountryAndYear(country, year);

                // Salvar novos feriados
                int savedCount = 0;
                for (CalendarApiResponse.Holiday apiHoliday :
                        response.getResponse().getHolidays()) {
                    Holiday holiday = holidayMapper.toEntity(apiHoliday, country);
                    holidayRepository.save(holiday);
                    savedCount++;
                }

                log.info(
                        "Sincronização concluída. {} feriados salvos para {} em {}",
                        savedCount,
                        country,
                        year);
            }
        } catch (ExternalApiException e) {
            log.error("Erro ao sincronizar feriados: {}", e.getMessage());
            throw new BusinessException("Não foi possível sincronizar feriados: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "holidays", key = "#country + '_' + #year")
    public List<HolidayDTO> getHolidaysByCountryAndYear(String country, int year) {
        log.info("Buscando feriados para: {} no ano {}", country, year);

        return holidayRepository.findByCountryAndYear(country, year).stream()
                .map(holidayMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HolidayDTO> getHolidaysForDate(LocalDate date, String country) {
        log.info("Buscando feriados para a data: {} no país {}", date, country);

        List<Holiday> holidays = holidayRepository.findByDateAndCountry(date, country);

        return holidays.stream().map(holidayMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<HolidayDTO> getHolidaysForMonth(String country, int year, int month) {
        log.info("Buscando feriados para o mês {}/{} no país {}", month, year, country);

        return holidayRepository.findByCountryAndYearAndMonth(country, year, month).stream()
                .map(holidayMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HolidayDTO createHoliday(HolidayDTO holidayDTO) {
        log.info("Criando novo feriado: {}", holidayDTO.getName());

        // Verificar se já existe feriado na mesma data
        if (holidayRepository.existsByDateAndCountryAndName(
                holidayDTO.getDate(), holidayDTO.getCountry(), holidayDTO.getName())) {
            throw new BusinessException("Já existe um feriado cadastrado com este nome nesta data");
        }

        Holiday holiday = holidayMapper.toEntity(holidayDTO);
        Holiday saved = holidayRepository.save(holiday);

        return holidayMapper.toDTO(saved);
    }

    @Override
    public HolidayDTO updateHoliday(String id, HolidayDTO holidayDTO) {
        log.info("Atualizando feriado: {}", id);

        Holiday holiday =
                holidayRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Feriado não encontrado"));

        // Verificar se a data está sendo alterada
        if (!holiday.getDate().equals(holidayDTO.getDate())
                && holidayRepository.existsByDateAndCountryAndName(
                        holidayDTO.getDate(), holidayDTO.getCountry(), holidayDTO.getName())) {
            throw new BusinessException("Já existe um feriado cadastrado com este nome nesta data");
        }

        holiday.setName(holidayDTO.getName());
        holiday.setDate(holidayDTO.getDate());
        holiday.setType(holidayDTO.getType());
        holiday.setDescription(holidayDTO.getDescription());
        holiday.setIsNational(holidayDTO.getIsNational());
        holiday.setIsGlobal(holidayDTO.getIsGlobal());
        holiday.setPrimaryType(holidayDTO.getPrimaryType());

        Holiday updated = holidayRepository.save(holiday);
        return holidayMapper.toDTO(updated);
    }

    @Override
    @CacheEvict(
            value = {"holidays", "calendarData"},
            allEntries = true)
    public void deleteHoliday(String id) {
        log.info("Deletando feriado: {}", id);

        if (!holidayRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feriado não encontrado");
        }

        holidayRepository.deleteById(id);
    }

    @Override
    public List<EventDTO> getEventsBetweenDates(LocalDate startDate, LocalDate endDate) {
        log.info("Buscando eventos entre {} e {}", startDate, endDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        return eventRepository.findEventsBetweenDates(start, end).stream()
                .map(eventMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getEventsByDate(LocalDate date) {
        log.info("Buscando eventos para a data: {}", date);

        return eventRepository.findEventsByDate(date).stream()
                .map(eventMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getUpcomingEvents(int limit) {
        log.info("Buscando eventos futuros (limite: {})", limit);

        return eventRepository.findUpcomingEvents(LocalDateTime.now()).stream()
                .limit(limit)
                .map(eventMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EventDTO createEvent(EventDTO eventDTO) {
        log.info("Criando novo evento: {}", eventDTO.getTitle());

        validateEventDates(eventDTO);

        Event event = eventMapper.toEntity(eventDTO);
        event.setCreatedBy(getCurrentUsername());
        event.setCreatedById(getCurrentUserId());
        event.setStatus("SCHEDULED");

        Event saved = eventRepository.save(event);

        return eventMapper.toDTO(saved);
    }

    @Override
    public EventDTO updateEvent(String id, EventDTO eventDTO) {
        log.info("Atualizando evento: {}", id);

        Event event =
                eventRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado"));

        validateEventDates(eventDTO);

        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setStartDateTime(eventDTO.getStartDateTime());
        event.setEndDateTime(eventDTO.getEndDateTime());
        event.setLocation(eventDTO.getLocation());
        event.setType(eventDTO.getType());
        event.setPriority(eventDTO.getPriority());
        event.setStatus(eventDTO.getStatus());
        event.setColor(eventDTO.getColor());
        event.setIsAllDay(eventDTO.getIsAllDay());
        event.setIsActive(eventDTO.getIsActive());
        event.setUpdatedBy(getCurrentUsername());

        Event updated = eventRepository.save(event);
        return eventMapper.toDTO(updated);
    }

    @Override
    public void deleteEvent(String id) {
        log.info("Deletando evento: {}", id);

        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Evento não encontrado");
        }

        eventRepository.deleteById(id);
    }

    @Override
    public boolean isHoliday(LocalDate date, String country) {
        List<Holiday> holidays = holidayRepository.findByDateAndCountry(date, country);
        return !holidays.isEmpty();
    }

    @Override
    public CalendarResponseDTO.CalendarStatisticsDTO getStatistics(String country, int year) {
        log.info("Obtendo estatísticas para: {} no ano {}", country, year);

        List<Holiday> holidays = holidayRepository.findByCountryAndYear(country, year);
        List<Event> events = eventRepository.findAll();

        // Calcular estatísticas
        int totalDays = LocalDate.of(year, 12, 31).getDayOfYear();
        long weekends = calculateWeekends(year);
        long workingDays = totalDays - weekends - holidays.size();

        // Distribuição de feriados por tipo
        Map<String, Long> holidayDistribution =
                holidays.stream()
                        .collect(
                                Collectors.groupingBy(
                                        h -> h.getType() != null ? h.getType() : "Outros",
                                        Collectors.counting()));

        List<CalendarResponseDTO.HolidayStatisticsDTO> distribution =
                holidayDistribution.entrySet().stream()
                        .map(
                                entry ->
                                        CalendarResponseDTO.HolidayStatisticsDTO.builder()
                                                .type(entry.getKey())
                                                .count(entry.getValue())
                                                .description(entry.getKey())
                                                .build())
                        .collect(Collectors.toList());

        // Mês com mais feriados
        Map<Integer, Long> holidaysByMonth =
                holidays.stream()
                        .collect(
                                Collectors.groupingBy(
                                        h -> h.getDate().getMonthValue(), Collectors.counting()));

        String monthWithMostHolidays =
                holidaysByMonth.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(entry -> getMonthName(entry.getKey()))
                        .orElse("N/A");

        return CalendarResponseDTO.CalendarStatisticsDTO.builder()
                .totalDays(totalDays)
                .workingDays((int) workingDays)
                .holidays(holidays.size())
                .weekends((int) weekends)
                .events(events.size())
                .averageEventsPerDay(events.isEmpty() ? 0.0 : (double) events.size() / totalDays)
                .mostActiveDay(findMostActiveDay(events))
                .monthWithMostHolidays(monthWithMostHolidays)
                .holidayDistribution(distribution)
                .build();
    }

    // Métodos auxiliares privados

    private CalendarResponseDTO buildCalendarResponse(
            String country,
            int year,
            int month,
            List<Holiday> holidays,
            List<Event> events,
            CalendarRequestDTO request) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate firstDay = yearMonth.atDay(1);
        LocalDate lastDay = yearMonth.atEndOfMonth();

        List<CalendarResponseDTO.CalendarDayDTO> calendarDays = new ArrayList<>();
        int totalWorkingDays = 0;
        int weekendsCount = 0;

        LocalDate currentDate = firstDay;
        while (!currentDate.isAfter(lastDay)) {
            LocalDate dateForDay = currentDate;
            boolean isWeekend = isWeekend(dateForDay);
            List<Holiday> dayHolidays =
                    holidays.stream().filter(h -> h.getDate().equals(dateForDay)).toList();
            boolean isHoliday = !dayHolidays.isEmpty();
            boolean isWorkingDay = !isWeekend && !isHoliday;

            if (isWorkingDay) {
                totalWorkingDays++;
            }
            if (isWeekend) {
                weekendsCount++;
            }

            String holidayName = isHoliday ? dayHolidays.get(0).getName() : null;

            List<Event> dayEvents =
                    events.stream()
                            .filter(e -> e.getStartDateTime().toLocalDate().equals(dateForDay))
                            .toList();

            calendarDays.add(
                    CalendarResponseDTO.CalendarDayDTO.builder()
                            .date(dateForDay)
                            .dayOfMonth(dateForDay.getDayOfMonth())
                            .dayOfWeek(getDayOfWeekPortuguese(dateForDay))
                            .dayOfWeekShort(getDayOfWeekShortPortuguese(dateForDay))
                            .isWeekend(isWeekend)
                            .isHoliday(isHoliday)
                            .isWorkingDay(isWorkingDay)
                            .holidayName(holidayName)
                            .holidays(
                                    dayHolidays.stream()
                                            .map(holidayMapper::toDTO)
                                            .collect(Collectors.toList()))
                            .events(
                                    dayEvents.stream()
                                            .map(eventMapper::toDTO)
                                            .collect(Collectors.toList()))
                            .formattedDate(dateForDay.format(DATE_FORMATTER))
                            .build());

            currentDate = currentDate.plusDays(1);
        }

        return CalendarResponseDTO.builder()
                .country(country)
                .countryName(getCountryName(country))
                .year(year)
                .month(month)
                .currentDate(LocalDate.now())
                .generatedAt(LocalDateTime.now())
                .language(request.getLanguage())
                .fromCache(false)
                .totalDays(yearMonth.lengthOfMonth())
                .totalWorkingDays(totalWorkingDays)
                .totalHolidays(holidays.size())
                .totalEvents(events.size())
                .weekendsCount(weekendsCount)
                .holidays(holidays.stream().map(holidayMapper::toDTO).collect(Collectors.toList()))
                .events(events.stream().map(eventMapper::toDTO).collect(Collectors.toList()))
                .calendarDays(calendarDays)
                .statistics(buildStatistics(yearMonth, holidays, events))
                .build();
    }

    private CalendarResponseDTO.CalendarStatisticsDTO buildStatistics(
            YearMonth yearMonth, List<Holiday> holidays, List<Event> events) {
        int totalDays = yearMonth.lengthOfMonth();
        long weekends = holidays.stream().filter(h -> isWeekend(h.getDate())).count();

        return CalendarResponseDTO.CalendarStatisticsDTO.builder()
                .totalDays(totalDays)
                .workingDays((int) (totalDays - weekends - holidays.size()))
                .holidays(holidays.size())
                .weekends((int) weekends)
                .events(events.size())
                .averageEventsPerDay(events.isEmpty() ? 0.0 : (double) events.size() / totalDays)
                .mostActiveDay(findMostActiveDay(events))
                .build();
    }

    private boolean isWeekend(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }

    private String getDayOfWeekPortuguese(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> "Segunda-feira";
            case TUESDAY -> "Terça-feira";
            case WEDNESDAY -> "Quarta-feira";
            case THURSDAY -> "Quinta-feira";
            case FRIDAY -> "Sexta-feira";
            case SATURDAY -> "Sábado";
            case SUNDAY -> "Domingo";
        };
    }

    private String getDayOfWeekShortPortuguese(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> "Seg";
            case TUESDAY -> "Ter";
            case WEDNESDAY -> "Qua";
            case THURSDAY -> "Qui";
            case FRIDAY -> "Sex";
            case SATURDAY -> "Sáb";
            case SUNDAY -> "Dom";
        };
    }

    private long calculateWeekends(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        long weekends = 0;

        LocalDate current = start;
        while (!current.isAfter(end)) {
            if (isWeekend(current)) {
                weekends++;
            }
            current = current.plusDays(1);
        }
        return weekends;
    }

    private String findMostActiveDay(List<Event> events) {
        if (events.isEmpty()) {
            return "N/A";
        }

        Map<LocalDate, Long> eventsByDay =
                events.stream()
                        .collect(
                                Collectors.groupingBy(
                                        e -> e.getStartDateTime().toLocalDate(),
                                        Collectors.counting()));

        return eventsByDay.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> entry.getKey().format(DATE_FORMATTER))
                .orElse("N/A");
    }

    private String getMonthName(int month) {
        String[] months = {
            "Janeiro", "Fevereiro", "Março", "Abril",
            "Maio", "Junho", "Julho", "Agosto",
            "Setembro", "Outubro", "Novembro", "Dezembro"
        };
        return months[month - 1];
    }

    private String getCountryName(String countryCode) {
        Map<String, String> countries = new HashMap<>();
        countries.put("BR", "Brasil");
        countries.put("US", "Estados Unidos");
        countries.put("PT", "Portugal");
        countries.put("ES", "Espanha");
        countries.put("FR", "França");
        countries.put("IT", "Itália");
        countries.put("DE", "Alemanha");
        countries.put("GB", "Reino Unido");
        countries.put("JP", "Japão");
        countries.put("CN", "China");
        countries.put("AR", "Argentina");
        countries.put("MX", "México");
        countries.put("CO", "Colômbia");
        countries.put("CL", "Chile");
        countries.put("PE", "Peru");
        countries.put("UY", "Uruguai");
        countries.put("PY", "Paraguai");
        countries.put("BO", "Bolívia");
        countries.put("VE", "Venezuela");
        countries.put("EC", "Equador");

        return countries.getOrDefault(countryCode.toUpperCase(), countryCode);
    }

    private void validateEventDates(EventDTO eventDTO) {
        if (eventDTO.getStartDateTime().isAfter(eventDTO.getEndDateTime())) {
            throw new BusinessException("Data de início não pode ser posterior à data de término");
        }

        // Permitir criação de eventos no passado apenas para ADMIN
        if (eventDTO.getStartDateTime().isBefore(LocalDateTime.now())) {
            // Verificar role do usuário (será verificado no controller)
            throw new BusinessException("Não é possível criar eventos no passado");
        }
    }

    private String getCurrentUsername() {
        // Implementar com SecurityContextHolder
        return "system";
    }

    private String getCurrentUserId() {
        // Implementar com SecurityContextHolder
        return "system";
    }
}
