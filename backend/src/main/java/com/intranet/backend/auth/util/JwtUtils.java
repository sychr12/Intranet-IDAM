package com.intranet.backend.auth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

@Component
@Slf4j
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    /**
     * Extrai o token JWT do cabeçalho da requisição
     */
    public Optional<String> extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        
        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            return Optional.of(bearerToken.substring(BEARER_PREFIX.length()));
        }
        
        return Optional.empty();
    }

    /**
     * Extrai o username do token JWT
     */
    public String extractUsername(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (Exception e) {
            log.error("Erro ao extrair username do token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrai a data de expiração do token JWT
     */
    public Date extractExpiration(String token) {
        try {
            return extractAllClaims(token).getExpiration();
        } catch (Exception e) {
            log.error("Erro ao extrair expiração do token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrai todas as claims do token JWT
     */
    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("Erro ao extrair claims do token: {}", e.getMessage());
            throw new RuntimeException("Token inválido", e);
        }
    }

    /**
     * Verifica se o token está expirado
     */
    public boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        return expiration != null && expiration.before(new Date());
    }

    /**
     * Obtém a chave de assinatura
     */
    private SecretKey getSignKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Obtém o usuário atual autenticado
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof UserDetails) {
                return ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                return (String) principal;
            }
        }
        
        return null;
    }

    /**
     * Verifica se o usuário atual está autenticado
     */
    public boolean isCurrentUserAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    /**
     * Obtém o token JWT da requisição atual
     */
    public Optional<String> getCurrentToken(HttpServletRequest request) {
        return extractTokenFromRequest(request);
    }

    /**
     * Limpa o token do cabeçalho (útil para logout)
     */
    public void clearTokenFromContext() {
        SecurityContextHolder.clearContext();
    }

    /**
     * Verifica se o token é um refresh token
     */
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extrai a role do usuário do token
     */
    public String extractRole(String token) {
        try {
            Claims claims = extractAllClaims(token);
            // As authorities estão salvas como uma lista
            var authorities = claims.get("authorities");
            if (authorities != null) {
                String authStr = authorities.toString();
                // Extrai o nome da role (ex: ROLE_ADMIN -> ADMIN)
                if (authStr.contains("ROLE_")) {
                    String role = authStr.substring(authStr.indexOf("ROLE_") + 5);
                    if (role.contains(",")) {
                        role = role.substring(0, role.indexOf(","));
                    }
                    if (role.contains("]")) {
                        role = role.substring(0, role.indexOf("]"));
                    }
                    return role.trim();
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Erro ao extrair role do token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Verifica se o token é válido (não expirado e com formato correto)
     */
    public boolean isValidToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Calcula o tempo restante para expiração do token em milissegundos
     */
    public long getTimeToExpire(String token) {
        Date expiration = extractExpiration(token);
        if (expiration == null) {
            return 0;
        }
        return expiration.getTime() - new Date().getTime();
    }

    /**
     * Formata o tempo de expiração para uma string legível
     */
    public String getFormattedExpirationTime(String token) {
        long timeToExpire = getTimeToExpire(token);
        if (timeToExpire <= 0) {
            return "Token expirado";
        }
        
        long hours = timeToExpire / 3600000;
        long minutes = (timeToExpire % 3600000) / 60000;
        long seconds = (timeToExpire % 60000) / 1000;
        
        if (hours > 0) {
            return String.format("%dh %dm %ds", hours, minutes, seconds);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, seconds);
        } else {
            return String.format("%ds", seconds);
        }
    }

    /**
     * Obtém informações detalhadas do token para debug
     */
    public String getTokenInfo(String token) {
        try {
            Claims claims = extractAllClaims(token);
            StringBuilder info = new StringBuilder();
            info.append("Subject: ").append(claims.getSubject()).append("\n");
            info.append("IssuedAt: ").append(claims.getIssuedAt()).append("\n");
            info.append("Expiration: ").append(claims.getExpiration()).append("\n");
            info.append("Time to expire: ").append(getFormattedExpirationTime(token)).append("\n");
            info.append("Is refresh: ").append(isRefreshToken(token)).append("\n");
            
            Object authorities = claims.get("authorities");
            if (authorities != null) {
                info.append("Authorities: ").append(authorities).append("\n");
            }
            
            return info.toString();
        } catch (Exception e) {
            return "Token inválido: " + e.getMessage();
        }
    }

    /**
     * Extrai o ID do usuário do token (se estiver presente)
     */
    public String extractUserId(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.get("userId", String.class);
        } catch (Exception e) {
            log.error("Erro ao extrair userId do token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Verifica se o token tem a role específica
     */
    public boolean hasRole(String token, String role) {
        String tokenRole = extractRole(token);
        return tokenRole != null && tokenRole.equalsIgnoreCase(role);
    }

    /**
     * Verifica se o token tem alguma das roles específicas
     */
    public boolean hasAnyRole(String token, String... roles) {
        String tokenRole = extractRole(token);
        if (tokenRole == null) {
            return false;
        }
        
        for (String role : roles) {
            if (tokenRole.equalsIgnoreCase(role)) {
                return true;
            }
        }
        return false;
    }
}
