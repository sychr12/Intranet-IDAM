package com.intranet.backend.calendar.service;

import com.intranet.backend.calendar.dto.CalendarRequestDTO;
import com.intranet.backend.calendar.dto.CalendarResponseDTO;
import com.intranet.backend.calendar.dto.EventDTO;
import com.intranet.backend.calendar.dto.HolidayDTO;

import java.time.LocalDate;
import java.util.List;

public interface CalendarService {

    CalendarResponseDTO getCalendarData(CalendarRequestDTO request);

    void syncHolidaysFromApi(String country, int year);

    List<HolidayDTO> getHolidaysByCountryAndYear(String country, int year);

    List<HolidayDTO> getHolidaysForDate(LocalDate date, String country);

    List<HolidayDTO> getHolidaysForMonth(String country, int year, int month);

    HolidayDTO createHoliday(HolidayDTO holidayDTO);

    HolidayDTO updateHoliday(String id, HolidayDTO holidayDTO);

    void deleteHoliday(String id);

    List<EventDTO> getEventsBetweenDates(LocalDate startDate, LocalDate endDate);

    List<EventDTO> getEventsByDate(LocalDate date);

    List<EventDTO> getUpcomingEvents(int limit);

    EventDTO createEvent(EventDTO eventDTO);

    EventDTO updateEvent(String id, EventDTO eventDTO);

    void deleteEvent(String id);

    boolean isHoliday(LocalDate date, String country);

    CalendarResponseDTO.CalendarStatisticsDTO getStatistics(String country, int year);
}
