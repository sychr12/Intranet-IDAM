package com.intranet.backend.common.annotation;

import java.lang.annotation.*;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = EnumValidator.class)
public @interface ValidateEnum {
    Class<? extends Enum<?>> enumClass();

    String message() default "Valor inválido para o campo";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
