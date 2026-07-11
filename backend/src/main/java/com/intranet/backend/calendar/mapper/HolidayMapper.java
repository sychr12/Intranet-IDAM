package com.intranet.backend.calendar.mapper;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Component;

import com.intranet.backend.calendar.dto.CalendarApiResponse;
import com.intranet.backend.calendar.dto.HolidayDTO;
import com.intranet.backend.calendar.model.Holiday;

@Component
public class HolidayMapper {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public HolidayDTO toDTO(Holiday holiday) {
        if (holiday == null) {
            return null;
        }

        LocalDate today = LocalDate.now();

        return HolidayDTO.builder()
                .id(holiday.getId())
                .name(holiday.getName())
                .date(holiday.getDate())
                .country(holiday.getCountry())
                .type(holiday.getType())
                .description(holiday.getDescription())
                .isNational(holiday.getIsNational())
                .isGlobal(holiday.getIsGlobal())
                .primaryType(holiday.getPrimaryType())
                .apiId(holiday.getApiId())
                .formattedDate(holiday.getDate().format(DATE_FORMATTER))
                .dayOfWeek(getDayOfWeekPortuguese(holiday.getDate()))
                .daysUntil((int) ChronoUnit.DAYS.between(today, holiday.getDate()))
                .isToday(holiday.getDate().equals(today))
                .isUpcoming(holiday.getDate().isAfter(today))
                .build();
    }

    public Holiday toEntity(HolidayDTO dto) {
        if (dto == null) {
            return null;
        }

        return Holiday.builder()
                .id(dto.getId())
                .name(dto.getName())
                .date(dto.getDate())
                .country(dto.getCountry())
                .type(dto.getType())
                .description(dto.getDescription())
                .isNational(dto.getIsNational())
                .isGlobal(dto.getIsGlobal())
                .primaryType(dto.getPrimaryType())
                .apiId(dto.getApiId())
                .build();
    }

    public Holiday toEntity(CalendarApiResponse.Holiday apiHoliday, String country) {
        if (apiHoliday == null) {
            return null;
        }

        LocalDate date = LocalDate.parse(apiHoliday.getDate().getIso());

        return Holiday.builder()
                .name(apiHoliday.getName())
                .date(date)
                .country(country)
                .type(
                        apiHoliday.getType() != null && !apiHoliday.getType().isEmpty()
                                ? apiHoliday.getType().get(0)
                                : "National holiday")
                .description(apiHoliday.getDescription())
                .isNational(true)
                .isGlobal(apiHoliday.getGlobal() != null && apiHoliday.getGlobal())
                .primaryType(apiHoliday.getPrimaryType())
                .apiId(apiHoliday.getUrlid())
                .build();
    }

    private String getDayOfWeekPortuguese(LocalDate date) {
        if (date == null) {
            return null;
        }

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
}
