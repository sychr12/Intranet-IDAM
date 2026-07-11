package com.intranet.backend.common.util;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import com.intranet.backend.common.exception.ValidationException;

public final class ValidationUtils {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    private static final String PASSWORD_REGEX =
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$";

    private ValidationUtils() {
        // Utility class
    }

    public static void validateEmail(String email) {
        if (StringUtils.isNullOrEmpty(email)) {
            throw new ValidationException("Email é obrigatório");
        }
        if (!Pattern.matches(EMAIL_REGEX, email)) {
            throw new ValidationException("Email inválido");
        }
    }

    public static void validatePassword(String password) {
        if (StringUtils.isNullOrEmpty(password)) {
            throw new ValidationException("Senha é obrigatória");
        }
        if (password.length() < 8) {
            throw new ValidationException("Senha deve ter no mínimo 8 caracteres");
        }
        if (!Pattern.matches(PASSWORD_REGEX, password)) {
            throw new ValidationException(
                    "Senha deve conter pelo menos uma letra maiúscula, uma minúscula, "
                            + "um número e um caractere especial");
        }
    }

    public static void validateRequired(String value, String fieldName) {
        if (StringUtils.isNullOrEmpty(value)) {
            throw new ValidationException(fieldName + " é obrigatório");
        }
    }

    public static void validateLength(String value, int min, int max, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName + " é obrigatório");
        }
        if (value.length() < min) {
            throw new ValidationException(fieldName + " deve ter no mínimo " + min + " caracteres");
        }
        if (value.length() > max) {
            throw new ValidationException(fieldName + " deve ter no máximo " + max + " caracteres");
        }
    }

    public static void validateRange(Number value, Number min, Number max, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName + " é obrigatório");
        }
        if (value.doubleValue() < min.doubleValue()) {
            throw new ValidationException(fieldName + " deve ser maior ou igual a " + min);
        }
        if (value.doubleValue() > max.doubleValue()) {
            throw new ValidationException(fieldName + " deve ser menor ou igual a " + max);
        }
    }

    public static void validateDateRange(
            LocalDate start, LocalDate end, String startField, String endField) {
        if (start != null && end != null && start.isAfter(end)) {
            throw new ValidationException(endField + " deve ser posterior a " + startField);
        }
    }

    public static Map<String, String> getValidationErrors() {
        return new HashMap<>();
    }

    public static void addError(Map<String, String> errors, String field, String message) {
        errors.put(field, message);
    }

    public static void throwIfHasErrors(Map<String, String> errors, String message) {
        if (!errors.isEmpty()) {
            throw new ValidationException(message, errors);
        }
    }
}
