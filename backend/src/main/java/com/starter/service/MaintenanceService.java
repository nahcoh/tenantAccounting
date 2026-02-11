package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.Maintenance;
import com.starter.dto.request.MaintenanceCreateRequest;
import com.starter.dto.response.MaintenanceResponse;
import com.starter.enums.MaintenanceStatus;
import com.starter.repository.ContractRepository;
import com.starter.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final ContractRepository contractRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".pdf", ".jpg", ".jpeg", ".png");

    public List<MaintenanceResponse> getMaintenancesByContract(Long userId, Long contractId) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);
        return maintenanceRepository.findByContractIdOrderByCreatedAtDesc(contract.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<MaintenanceResponse> getMaintenancesByContractAndStatus(Long userId, Long contractId, MaintenanceStatus status) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);
        return maintenanceRepository.findByContractIdAndStatusOrderByCreatedAtDesc(contract.getId(), status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceResponse createMaintenance(Long userId, Long contractId, MaintenanceCreateRequest request) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);

        Maintenance maintenance = new Maintenance();
        maintenance.setContract(contract);
        maintenance.setTitle(request.getTitle());
        maintenance.setCategory(request.getCategory());
        maintenance.setDescription(request.getDescription());
        maintenance.setStatus(MaintenanceStatus.REQUESTED);
        maintenance.setCost(request.getCost());
        maintenance.setPaidBy(request.getPaidBy());

        return toResponse(maintenanceRepository.save(maintenance));
    }

    @Transactional
    public MaintenanceResponse updateMaintenance(Long userId, Long maintenanceId, MaintenanceCreateRequest request) {
        Maintenance maintenance = getMaintenanceAndVerifyOwner(userId, maintenanceId);
        maintenance.setTitle(request.getTitle());
        maintenance.setCategory(request.getCategory());
        maintenance.setDescription(request.getDescription());
        maintenance.setCost(request.getCost());
        maintenance.setPaidBy(request.getPaidBy());
        return toResponse(maintenanceRepository.save(maintenance));
    }

    @Transactional
    public MaintenanceResponse updateStatus(Long userId, Long maintenanceId, MaintenanceStatus status) {
        Maintenance maintenance = getMaintenanceAndVerifyOwner(userId, maintenanceId);
        maintenance.setStatus(status);
        if (status == MaintenanceStatus.COMPLETED) {
            maintenance.setCompletedAt(LocalDateTime.now());
        } else {
            maintenance.setCompletedAt(null);
        }
        return toResponse(maintenanceRepository.save(maintenance));
    }

    @Transactional
    public void deleteMaintenance(Long userId, Long maintenanceId) {
        Maintenance maintenance = getMaintenanceAndVerifyOwner(userId, maintenanceId);
        if (maintenance.getFilePath() != null && !maintenance.getFilePath().isBlank()) {
            try {
                Files.deleteIfExists(Paths.get(maintenance.getFilePath()));
            } catch (IOException ignored) {}
        }
        maintenanceRepository.delete(maintenance);
    }

    @Transactional
    public MaintenanceResponse uploadFile(Long userId, Long maintenanceId, MultipartFile file) {
        Maintenance maintenance = getMaintenanceAndVerifyOwner(userId, maintenanceId);

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (PDF, JPG, PNG만 가능)");
        }

        try {
            Path dir = Paths.get(uploadDir, "maintenances", maintenanceId.toString());
            Files.createDirectories(dir);

            if (maintenance.getFilePath() != null && !maintenance.getFilePath().isBlank()) {
                Files.deleteIfExists(Paths.get(maintenance.getFilePath()));
            }

            String storedName = UUID.randomUUID() + ext;
            Path filePath = dir.resolve(storedName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            maintenance.setFilePath(filePath.toString());
            maintenance.setFileName(originalName);
            return toResponse(maintenanceRepository.save(maintenance));
        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다.", e);
        }
    }

    public Resource downloadFile(Long userId, Long maintenanceId) {
        Maintenance maintenance = getMaintenanceAndVerifyOwner(userId, maintenanceId);
        if (maintenance.getFilePath() == null || maintenance.getFilePath().isBlank()) {
            throw new IllegalArgumentException("첨부된 파일이 없습니다.");
        }
        try {
            Path filePath = Paths.get(maintenance.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new IllegalArgumentException("파일을 찾을 수 없습니다.");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 경로 오류", e);
        }
    }

    @Transactional
    public MaintenanceResponse deleteFile(Long userId, Long maintenanceId) {
        Maintenance maintenance = getMaintenanceAndVerifyOwner(userId, maintenanceId);
        if (maintenance.getFilePath() != null && !maintenance.getFilePath().isBlank()) {
            try {
                Files.deleteIfExists(Paths.get(maintenance.getFilePath()));
            } catch (IOException ignored) {}
        }
        maintenance.setFilePath(null);
        maintenance.setFileName(null);
        return toResponse(maintenanceRepository.save(maintenance));
    }

    private Contract getContractAndVerifyOwner(Long userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));
        if (!contract.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return contract;
    }

    private Maintenance getMaintenanceAndVerifyOwner(Long userId, Long maintenanceId) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance not found with id: " + maintenanceId));
        if (!maintenance.getContract().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return maintenance;
    }

    private MaintenanceResponse toResponse(Maintenance maintenance) {
        MaintenanceResponse response = new MaintenanceResponse();
        response.setId(maintenance.getId());
        response.setContractId(maintenance.getContract().getId());
        response.setTitle(maintenance.getTitle());
        response.setCategory(maintenance.getCategory());
        response.setDescription(maintenance.getDescription());
        response.setStatus(maintenance.getStatus());
        response.setCost(maintenance.getCost());
        response.setPaidBy(maintenance.getPaidBy());
        response.setFilePath(maintenance.getFilePath());
        response.setFileName(maintenance.getFileName());
        response.setCompletedAt(maintenance.getCompletedAt());
        response.setCreatedAt(maintenance.getCreatedAt());
        return response;
    }
}
