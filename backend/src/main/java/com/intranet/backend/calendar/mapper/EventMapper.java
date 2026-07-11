package com.intranet.backend.calendar.mapper;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

import com.intranet.backend.calendar.dto.EventDTO;
import com.intranet.backend.calendar.model.Event;

@Component
public class EventMapper {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public EventDTO toDTO(Event event) {
        if (event == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();

        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startDateTime(event.getStartDateTime())
                .endDateTime(event.getEndDateTime())
                .location(event.getLocation())
                .type(event.getType())
                .priority(event.getPriority())
                .status(event.getStatus())
                .color(event.getColor())
                .isAllDay(event.getIsAllDay())
                .isActive(event.getIsActive())
                .createdBy(event.getCreatedBy())
                .createdById(event.getCreatedById())
                .duration(calculateDuration(event.getStartDateTime(), event.getEndDateTime()))
                .formattedStart(event.getStartDateTime().format(DATE_TIME_FORMATTER))
                .formattedEnd(event.getEndDateTime().format(DATE_TIME_FORMATTER))
                .isPast(event.getEndDateTime().isBefore(now))
                .isToday(event.getStartDateTime().toLocalDate().equals(now.toLocalDate()))
                .isUpcoming(event.getStartDateTime().isAfter(now))
                .build();
    }

    public Event toEntity(EventDTO dto) {
        if (dto == null) {
            return null;
        }

        return Event.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startDateTime(dto.getStartDateTime())
                .endDateTime(dto.getEndDateTime())
                .location(dto.getLocation())
                .type(dto.getType())
                .priority(dto.getPriority())
                .status(dto.getStatus())
                .color(dto.getColor())
                .isAllDay(dto.getIsAllDay())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdById(dto.getCreatedById())
                .build();
    }

    private String calculateDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return null;
        }

        Duration duration = Duration.between(start, end);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();

        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        }
        return String.format("%dm", minutes);
    }
}
