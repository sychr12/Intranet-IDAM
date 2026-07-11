package com.intranet.backend.common.exception;

public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException() {
        super("ão autorizado. Faça login para acessar este recurso.");
    }
}
