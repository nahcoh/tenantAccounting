package com.starter.controller;

import com.starter.dto.request.LoginRequest;
import com.starter.dto.request.SignupRequest;
import com.starter.dto.response.TokenResponse;
import com.starter.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/signup")
    public ResponseEntity<TokenResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        TokenResponse token = authService.signup(signupRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        TokenResponse token = authService.login(loginRequest);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/auth/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean available = authService.isEmailAvailable(email);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        TokenResponse token = authService.refresh(refreshToken);
        return ResponseEntity.ok(token);
    }

    @DeleteMapping("/users/me")
    public ResponseEntity<Void> deleteAccount(Principal principal) {
        authService.deleteAccount(principal.getName());
        return ResponseEntity.noContent().build();
    }
}
