package com.intranet.backend.calendar.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CalendarApiResponse {

    @JsonProperty("response")
    private Response response;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {
        private List<Holiday> holidays;
        private Meta meta;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Holiday {
        private String name;
        private String description;
        private Country country;
        private DateInfo date;
        private List<String> type;
        @JsonProperty("primary_type")
        private String primaryType;
        @JsonProperty("global")
        private Boolean global;
        @JsonProperty("canonical_url")
        private String canonicalUrl;
        private String urlid;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Country {
        private String id;
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DateInfo {
        @JsonProperty("iso")
        private String iso;
        @JsonProperty("datetime")
        private DateTime datetime;
        private String timezone;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DateTime {
        private Integer year;
        private Integer month;
        private Integer day;
        private String dayName;
        @JsonProperty("day_of_week")
        private Integer dayOfWeek;
        @JsonProperty("weekday")
        private String weekday;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Meta {
        private Integer code;
        private String timezone;
    }
}