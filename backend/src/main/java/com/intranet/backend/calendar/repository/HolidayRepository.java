package com.intranet.backend.calendar.repository;

import com.intranet.backend.calendar.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, String> {

    Optional<Holiday> findByDateAndCountryAndName(LocalDate date, String country, String name);

    List<Holiday> findByCountry(String country);

    @Query("SELECT h FROM Holiday h WHERE h.country = :country AND YEAR(h.date) = :year")
    List<Holiday> findByCountryAndYear(@Param("country") String country, @Param("year") int year);

    @Query("SELECT h FROM Holiday h WHERE h.country = :country AND YEAR(h.date) = :year AND MONTH(h.date) = :month")
    List<Holiday> findByCountryAndYearAndMonth(@Param("country") String country, 
                                               @Param("year") int year, 
                                               @Param("month") int month);

    @Query("SELECT h FROM Holiday h WHERE h.country = :country AND h.date BETWEEN :startDate AND :endDate")
    List<Holiday> findBetweenDates(@Param("country") String country,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);

    @Query("SELECT h FROM Holiday h WHERE h.country = :country AND h.date >= :date ORDER BY h.date")
    List<Holiday> findUpcomingHolidays(@Param("country") String country, @Param("date") LocalDate date);

    boolean existsByDateAndCountryAndName(LocalDate date, String country, String name);

    @Query("SELECT h FROM Holiday h WHERE h.country = :country AND h.date = :date")
    List<Holiday> findByDateAndCountry(@Param("date") LocalDate date, @Param("country") String country);

    @Modifying
    @Query("DELETE FROM Holiday h WHERE h.country = :country AND YEAR(h.date) = :year")
    void deleteByCountryAndYear(@Param("country") String country, @Param("year") int year);
}
