package com.starter.controller;

import com.starter.dto.request.UtilityCreateRequest;
import com.starter.dto.response.UtilityResponse;
import com.starter.enums.UtilityType;
import com.starter.service.UtilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilities")
@RequiredArgsConstructor
public class UtilityController {

    private final UtilityService utilityService;

    @GetMapping("/month/{yearMonth}")
    public ResponseEntity<List<UtilityResponse>> getUtilitiesByMonth(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String yearMonth) {
        Long userId = utilityService.getUserIdByEmail(userDetails.getUsername());
        List<UtilityResponse> utilities = utilityService.getUtilitiesByMonth(userId, yearMonth);
        return ResponseEntity.ok(utilities);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<UtilityResponse>> getUtilitiesByType(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UtilityType type) {
        Long userId = utilityService.getUserIdByEmail(userDetails.getUsername());
        List<UtilityResponse> utilities = utilityService.getUtilitiesByType(userId, type);
        return ResponseEntity.ok(utilities);
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<UtilityResponse>> getUtilitiesByYear(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String year) {
        Long userId = utilityService.getUserIdByEmail(userDetails.getUsername());
        List<UtilityResponse> utilities = utilityService.getUtilitiesByYear(userId, year);
        return ResponseEntity.ok(utilities);
    }

    @GetMapping("/summary/{yearMonth}")
    public ResponseEntity<Map<String, Object>> getUtilitySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String yearMonth) {
        Long userId = utilityService.getUserIdByEmail(userDetails.getUsername());
        Map<String, Object> summary = utilityService.getUtilitySummary(userId, yearMonth);
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<UtilityResponse> createUtility(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UtilityCreateRequest request) {
        Long userId = utilityService.getUserIdByEmail(userDetails.getUsername());
        UtilityResponse response = utilityService.createUtility(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilityResponse> updateUtility(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UtilityCreateRequest request) {
        Long userId = utilityService.getUserIdByEmail(userDetails.getUsername());
        UtilityResponse response = utilityService.updateUtility(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtility(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = utilityService.getUserIdByEmail(userDetails.getUsername());
        utilityService.deleteUtility(userId, id);
        return ResponseEntity.noContent().build();
    }
}
