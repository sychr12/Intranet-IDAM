package com.intranet.backend.common.annotation;

import java.util.HashSet;
import java.util.Set;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class EnumValidator implements ConstraintValidator<ValidateEnum, String> {

    private Set<String> validValues = new HashSet<>();

    @Override
    public void initialize(ValidateEnum constraintAnnotation) {
        Enum<?>[] enumConstants = constraintAnnotation.enumClass().getEnumConstants();
        for (Enum<?> enumConstant : enumConstants) {
            validValues.add(enumConstant.name());
        }
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return validValues.contains(value);
    }
}
