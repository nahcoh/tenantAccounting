package com.starter.service;

import com.starter.domain.User;
import com.starter.dto.request.LoginRequest;
import com.starter.dto.request.SignupRequest;
import com.starter.dto.response.TokenResponse;
import com.starter.repository.PaymentRepository;
import com.starter.repository.UserRepository;
import com.starter.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    @Transactional
    public TokenResponse signup(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(com.starter.enums.Role.USER)
                .provider(com.starter.enums.AuthProvider.local.toString())
                .build();

        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getName());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        return new TokenResponse(accessToken, refreshToken);
    }

    public TokenResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + loginRequest.getEmail()));

        if (user.getProvider() != null && !user.getProvider().equals(com.starter.enums.AuthProvider.local.toString())) {
            throw new IllegalArgumentException(user.getProvider() + " 계정입니다. 소셜 로그인을 이용해주세요.");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getName());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        return new TokenResponse(accessToken, refreshToken);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        paymentRepository.deleteByUserId(user.getId());
        userRepository.delete(user);
    }

    public TokenResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(email, user.getName());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);
        return new TokenResponse(newAccessToken, newRefreshToken);
    }
}
