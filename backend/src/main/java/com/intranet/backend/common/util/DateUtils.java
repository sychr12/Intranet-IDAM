package com.intranet.backend.common.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public final class DateUtils {

    public static final String DATE_FORMAT = "dd/MM/yyyy";
    public static final String DATETIME_FORMAT = "dd/MM/yyyy HH:mm:ss";
    public static final String ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    public static final String TIME_FORMAT = "HH:mm:ss";

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern(DATE_FORMAT);
    private static final DateTimeFormatter DATETIME_FORMATTER =
            DateTimeFormatter.ofPattern(DATETIME_FORMAT);
    private static final DateTimeFormatter TIME_FORMATTER =
            DateTimeFormatter.ofPattern(TIME_FORMAT);

    private DateUtils() {
        // Utility class
    }

    // ===== LocalDate =====

    public static String format(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    public static LocalDate parseDate(String dateStr) {
        return dateStr != null ? LocalDate.parse(dateStr, DATE_FORMATTER) : null;
    }

    public static LocalDate now() {
        return LocalDate.now();
    }

    public static LocalDate toLocalDate(Date date) {
        return date != null ? date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate() : null;
    }

    // ===== LocalDateTime =====

    public static String format(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : null;
    }

    public static String formatDateTime(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) return null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return dateTime.format(formatter);
    }

    public static LocalDateTime parseDateTime(String dateTimeStr) {
        return dateTimeStr != null ? LocalDateTime.parse(dateTimeStr, DATETIME_FORMATTER) : null;
    }

    public static LocalDateTime nowDateTime() {
        return LocalDateTime.now();
    }

    public static LocalDateTime toLocalDateTime(Date date) {
        return date != null
                ? date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
                : null;
    }

    // ===== Instant =====

    public static String format(Instant instant) {
        return instant != null ? instant.toString() : null;
    }

    public static Instant toInstant(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.atZone(ZoneId.systemDefault()).toInstant() : null;
    }

    // ===== Operações com datas =====

    public static LocalDate addDays(LocalDate date, long days) {
        return date != null ? date.plusDays(days) : null;
    }

    public static LocalDate subtractDays(LocalDate date, long days) {
        return date != null ? date.minusDays(days) : null;
    }

    public static LocalDateTime addHours(LocalDateTime dateTime, long hours) {
        return dateTime != null ? dateTime.plusHours(hours) : null;
    }

    public static long daysBetween(LocalDate start, LocalDate end) {
        return start != null && end != null
                ? Duration.between(start.atStartOfDay(), end.atStartOfDay()).toDays()
                : 0;
    }

    public static boolean isWeekend(LocalDate date) {
        if (date == null) return false;
        DayOfWeek day = date.getDayOfWeek();
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }

    public static boolean isToday(LocalDate date) {
        return date != null && date.equals(now());
    }

    public static boolean isFuture(LocalDate date) {
        return date != null && date.isAfter(now());
    }

    public static boolean isPast(LocalDate date) {
        return date != null && date.isBefore(now());
    }

    // ===== Formatação de tempo =====

    public static String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";

        LocalDateTime now = nowDateTime();
        Duration duration = Duration.between(dateTime, now);

        long seconds = duration.getSeconds();
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (seconds < 60) {
            return "agora mesmo";
        } else if (minutes < 60) {
            return minutes + " minuto" + (minutes > 1 ? "s" : "") + " atrás";
        } else if (hours < 24) {
            return hours + " hora" + (hours > 1 ? "s" : "") + " atrás";
        } else if (days < 30) {
            return days + " dia" + (days > 1 ? "s" : "") + " atrás";
        } else {
            return format(dateTime);
        }
    }

    public static String getTimeRemaining(LocalDateTime endDateTime) {
        if (endDateTime == null) return "N/A";

        LocalDateTime now = nowDateTime();
        if (endDateTime.isBefore(now)) {
            return "Expirado";
        }

        Duration duration = Duration.between(now, endDateTime);

        long days = duration.toDays();
        long hours = duration.toHours() % 24;
        long minutes = duration.toMinutes() % 60;

        if (days > 0) {
            return String.format("%d dias e %d horas", days, hours);
        } else if (hours > 0) {
            return String.format("%d horas e %d minutos", hours, minutes);
        } else {
            return String.format("%d minutos", minutes);
        }
    }
}
