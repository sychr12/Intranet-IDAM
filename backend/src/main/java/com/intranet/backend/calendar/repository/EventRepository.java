package com.intranet.backend.calendar.repository;

import com.intranet.backend.calendar.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    List<Event> findByIsActiveTrue();

    List<Event> findByCreatedById(String userId);

    @Query("SELECT e FROM Event e WHERE e.startDateTime BETWEEN :start AND :end AND e.isActive = true")
    List<Event> findEventsBetweenDates(@Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end);

    @Query("SELECT e FROM Event e WHERE e.startDateTime >= :date AND e.isActive = true ORDER BY e.startDateTime")
    List<Event> findUpcomingEvents(@Param("date") LocalDateTime date);

    @Query("SELECT e FROM Event e WHERE DATE(e.startDateTime) = :date AND e.isActive = true")
    List<Event> findEventsByDate(@Param("date") LocalDate date);

    @Query("SELECT e FROM Event e WHERE e.startDateTime <= :date AND e.endDateTime >= :date AND e.isActive = true")
    List<Event> findEventsForDateTime(@Param("date") LocalDateTime date);

    Page<Event> findByType(String type, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.priority = :priority AND e.isActive = true")
    List<Event> findEventsByPriority(@Param("priority") String priority);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.isActive = true")
    long countActiveEvents();

    @Query("SELECT e FROM Event e WHERE e.isAllDay = true AND DATE(e.startDateTime) = :date")
    List<Event> findAlldayEventsByDate(@Param("date") LocalDate date);
}