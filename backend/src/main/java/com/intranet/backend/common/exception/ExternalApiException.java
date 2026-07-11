package com.intranet.backend.common.exception;

public class ExternalApiException extends RuntimeException {
    private final String serviceName;
    private final int statusCode;

    public ExternalApiException(String message) {
        super(message);
        this.serviceName = null;
        this.statusCode = 0;
    }

    public ExternalApiException(String serviceName, String message) {
        super(message);
        this.serviceName = serviceName;
        this.statusCode = 0;
    }

    public ExternalApiException(String serviceName, String message, int statusCode) {
        super(message);
        this.serviceName = serviceName;
        this.statusCode = statusCode;
    }

    public ExternalApiException(String message, Throwable cause) {
        super(message, cause);
        this.serviceName = null;
        this.statusCode = 0;
    }

    public String getServiceName() {
        return serviceName;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
