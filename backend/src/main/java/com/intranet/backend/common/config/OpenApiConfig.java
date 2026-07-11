package com.intranet.backend.common.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@Configuration
@OpenAPIDefinition(
        info =
                @Info(
                        title = "Intranet API",
                        version = "1.0.0",
                        description = "API para o sistema de Intranet",
                        contact = @Contact(name = "Suporte", email = "suporte@intranet.com"),
                        license = @License(name = "Proprietary", url = "https://intranet.com")),
        servers = {
            @Server(description = "Local Server", url = "http://localhost:8080"),
            @Server(description = "Development Server", url = "https://dev.intranet.com")
        },
        security = {@SecurityRequirement(name = "bearerAuth")})
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT authentication",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER)
public class OpenApiConfig {}
