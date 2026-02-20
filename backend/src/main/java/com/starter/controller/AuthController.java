package com.starter.controller;

import com.starter.config.AppProperties;
import com.starter.dto.request.LoginRequest;
import com.starter.dto.request.SignupRequest;
import com.starter.dto.response.TokenResponse;
import com.starter.security.JwtTokenProvider;
import com.starter.security.UserPrincipal;
import com.starter.service.AuthService;
import com.starter.utils.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AppProperties appProperties;

    @PostMapping("/auth/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignupRequest signupRequest, HttpServletResponse response) {
        TokenResponse token = authService.signup(signupRequest);
        writeAuthCookies(response, token);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        TokenResponse token = authService.login(loginRequest);
        writeAuthCookies(response, token);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/auth/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean available = authService.isEmailAvailable(email);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<Void> refresh(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String refreshToken = CookieUtils.getCookie(request, appProperties.getAuth().getRefreshCookieName())
                .map(jakarta.servlet.http.Cookie::getValue)
                .orElse(body != null ? body.get("refreshToken") : null);
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is missing");
        }
        TokenResponse token = authService.refresh(refreshToken);
        writeAuthCookies(response, token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        clearAuthCookies(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, String>> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            String role = userPrincipal.getAuthorities().stream()
                    .findFirst()
                    .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                    .orElse("USER");
            return ResponseEntity.ok(Map.of(
                    "email", userPrincipal.getEmail(),
                    "name", userPrincipal.getDisplayName(),
                    "role", role
            ));
        }

        if (principal instanceof UserDetails userDetails) {
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                    .orElse("USER");
            return ResponseEntity.ok(Map.of(
                    "email", userDetails.getUsername(),
                    "name", userDetails.getUsername(),
                    "role", role
            ));
        }

        return ResponseEntity.ok(Map.of(
                "email", principal.toString(),
                "name", principal.toString(),
                "role", "USER"
        ));
    }

    @DeleteMapping("/users/me")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserPrincipal principal, HttpServletResponse response) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        authService.deleteAccount(principal.getEmail());
        clearAuthCookies(response);
        return ResponseEntity.noContent().build();
    }

    private void writeAuthCookies(HttpServletResponse response, TokenResponse token) {
        int accessTokenMaxAge = (int) (jwtTokenProvider.getAccessTokenExpiration() / 1000);
        int refreshTokenMaxAge = (int) (jwtTokenProvider.getRefreshTokenExpiration() / 1000);
        CookieUtils.addCookie(
                response,
                appProperties.getAuth().getAccessCookieName(),
                token.getAccessToken(),
                accessTokenMaxAge,
                true,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                appProperties.getAuth().getCookieDomain()
        );
        CookieUtils.addCookie(
                response,
                appProperties.getAuth().getRefreshCookieName(),
                token.getRefreshToken(),
                refreshTokenMaxAge,
                true,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                appProperties.getAuth().getCookieDomain()
        );
    }

    private void clearAuthCookies(HttpServletResponse response) {
        // Delete domain-scoped cookie (.ziplog.kr) and host-only cookie(ziplog.kr) both
        CookieUtils.deleteCookie(
                response,
                appProperties.getAuth().getAccessCookieName(),
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                appProperties.getAuth().getCookieDomain()
        );
        CookieUtils.deleteCookie(
                response,
                appProperties.getAuth().getRefreshCookieName(),
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                appProperties.getAuth().getCookieDomain()
        );
        CookieUtils.deleteCookie(
                response,
                appProperties.getAuth().getAccessCookieName(),
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                null
        );
        CookieUtils.deleteCookie(
                response,
                appProperties.getAuth().getRefreshCookieName(),
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                null
        );
    }
}
