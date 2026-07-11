package com.intranet.backend.common.interceptor;

import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class RequestInterceptor implements HandlerInterceptor {

    private static final String REQUEST_ID = "X-Request-ID";

    @Override
    public boolean preHandle(
            HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestId = request.getHeader(REQUEST_ID);
        if (requestId == null || requestId.isEmpty()) {
            requestId = UUID.randomUUID().toString();
            response.setHeader(REQUEST_ID, requestId);
        }

        request.setAttribute("requestId", requestId);
        request.setAttribute("startTime", System.currentTimeMillis());

        log.debug("Request [{}] {} {}", requestId, request.getMethod(), request.getRequestURI());
        return true;
    }

    @Override
    public void postHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            ModelAndView modelAndView) {
        // Post-processing
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex) {
        String requestId = (String) request.getAttribute("requestId");
        Long startTime = (Long) request.getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;

        log.debug(
                "Request [{}] completada em {} ms com status {}",
                requestId,
                duration,
                response.getStatus());

        if (ex != null) {
            log.error("Request [{}] finalizada com erro: {}", requestId, ex.getMessage());
        }
    }
}
