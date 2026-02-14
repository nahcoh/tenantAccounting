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
        CookieUtils.deleteCookie(
                response,
                appProperties.getAuth().getAccessCookieName(),
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite()
        );
        CookieUtils.deleteCookie(
                response,
                appProperties.getAuth().getRefreshCookieName(),
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite()
        );
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, String>> me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return ResponseEntity.ok(Map.of(
                "email", principal.getEmail(),
                "name", principal.getDisplayName()
        ));
    }

    @DeleteMapping("/users/me")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserPrincipal principal, HttpServletResponse response) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        authService.deleteAccount(principal.getEmail());
        CookieUtils.deleteCookie(
                response,
                appProperties.getAuth().getAccessCookieName(),
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite()
        );
        CookieUtils.deleteCookie(
                response,
                appProperties.getAuth().getRefreshCookieName(),
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite()
        );
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
                appProperties.getAuth().getCookieSameSite()
        );
        CookieUtils.addCookie(
                response,
                appProperties.getAuth().getRefreshCookieName(),
                token.getRefreshToken(),
                refreshTokenMaxAge,
                true,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite()
        );
    }
}
