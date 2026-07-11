package com.intranet.backend.common.aspect;

import java.util.Arrays;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import com.intranet.backend.common.annotation.LogExecutionTime;

import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("@annotation(logExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint, LogExecutionTime logExecutionTime)
            throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String methodName = signature.getMethod().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();

        if (logExecutionTime.logParameters()) {
            log.debug(
                    "Executando método: {}.{} com parâmetros: {}",
                    className,
                    methodName,
                    Arrays.toString(joinPoint.getArgs()));
        } else {
            log.debug("Executando método: {}.{}", className, methodName);
        }

        long startTime = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long endTime = System.currentTimeMillis();

        long executionTime = endTime - startTime;
        log.debug("Método {}.{} executado em {} ms", className, methodName, executionTime);

        if (logExecutionTime.logResult()) {
            log.debug("Resultado: {}", result);
        }

        return result;
    }

    @Around("execution(* com.intranet.backend..*Service.*(..))")
    public Object logServiceMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String methodName = signature.getMethod().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();

        log.info("Iniciando: {}.{}", className, methodName);

        try {
            Object result = joinPoint.proceed();
            log.info("Concluído com sucesso: {}.{}", className, methodName);
            return result;
        } catch (Exception e) {
            log.error("Erro em {}.{}: {}", className, methodName, e.getMessage());
            throw e;
        }
    }
}
