package com.starter.service;

import com.starter.domain.Checklist;
import com.starter.domain.Contract;
import com.starter.dto.request.ChecklistCreateRequest;
import com.starter.dto.response.ChecklistResponse;
import com.starter.enums.ChecklistCategory;
import com.starter.enums.ContractPhase;
import com.starter.repository.ChecklistRepository;
import com.starter.repository.ContractRepository;
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
public class ChecklistService {

    private final ChecklistRepository checklistRepository;
    private final ContractRepository contractRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".pdf", ".jpg", ".jpeg", ".png");

    public List<ChecklistResponse> getChecklistsByContract(Long userId, Long contractId) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);
        return checklistRepository.findByContractIdOrderByPhaseAscCreatedAtAsc(contract.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ChecklistResponse> getChecklistsByContractAndPhase(Long userId, Long contractId, ContractPhase phase) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);
        return checklistRepository.findByContractIdAndPhase(contract.getId(), phase).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChecklistResponse createChecklist(Long userId, Long contractId, ChecklistCreateRequest request) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);

        Checklist checklist = new Checklist();
        checklist.setContract(contract);
        checklist.setPhase(request.getPhase());
        checklist.setCategory(request.getCategory());
        checklist.setTitle(request.getTitle());
        checklist.setDescription(request.getDescription());
        checklist.setIsRequired(request.getIsRequired() != null ? request.getIsRequired() : false);
        checklist.setIsCompleted(false);

        return toResponse(checklistRepository.save(checklist));
    }

    @Transactional
    public ChecklistResponse updateChecklist(Long userId, Long checklistId, ChecklistCreateRequest request) {
        Checklist checklist = getChecklistAndVerifyOwner(userId, checklistId);
        checklist.setPhase(request.getPhase());
        checklist.setCategory(request.getCategory());
        checklist.setTitle(request.getTitle());
        checklist.setDescription(request.getDescription());
        checklist.setIsRequired(request.getIsRequired() != null ? request.getIsRequired() : false);
        return toResponse(checklistRepository.save(checklist));
    }

    @Transactional
    public ChecklistResponse toggleComplete(Long userId, Long checklistId) {
        Checklist checklist = getChecklistAndVerifyOwner(userId, checklistId);
        boolean newCompleted = !Boolean.TRUE.equals(checklist.getIsCompleted());
        checklist.setIsCompleted(newCompleted);
        checklist.setCompletedAt(newCompleted ? LocalDateTime.now() : null);
        return toResponse(checklistRepository.save(checklist));
    }

    @Transactional
    public void deleteChecklist(Long userId, Long checklistId) {
        Checklist checklist = getChecklistAndVerifyOwner(userId, checklistId);
        // 파일 삭제
        if (checklist.getFilePath() != null && !checklist.getFilePath().isBlank()) {
            try {
                Files.deleteIfExists(Paths.get(checklist.getFilePath()));
            } catch (IOException ignored) {}
        }
        checklistRepository.delete(checklist);
    }

    @Transactional
    public ChecklistResponse uploadFile(Long userId, Long checklistId, MultipartFile file) {
        Checklist checklist = getChecklistAndVerifyOwner(userId, checklistId);

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (PDF, JPG, PNG만 가능)");
        }

        try {
            Path dir = Paths.get(uploadDir, "checklists", checklistId.toString());
            Files.createDirectories(dir);

            // 기존 파일 삭제
            if (checklist.getFilePath() != null && !checklist.getFilePath().isBlank()) {
                Files.deleteIfExists(Paths.get(checklist.getFilePath()));
            }

            String storedName = UUID.randomUUID() + ext;
            Path filePath = dir.resolve(storedName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            checklist.setFilePath(filePath.toString());
            checklist.setFileName(originalName);
            return toResponse(checklistRepository.save(checklist));
        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다.", e);
        }
    }

    public Resource downloadFile(Long userId, Long checklistId) {
        Checklist checklist = getChecklistAndVerifyOwner(userId, checklistId);
        if (checklist.getFilePath() == null || checklist.getFilePath().isBlank()) {
            throw new IllegalArgumentException("첨부된 파일이 없습니다.");
        }
        try {
            Path filePath = Paths.get(checklist.getFilePath());
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
    public ChecklistResponse deleteFile(Long userId, Long checklistId) {
        Checklist checklist = getChecklistAndVerifyOwner(userId, checklistId);
        if (checklist.getFilePath() != null && !checklist.getFilePath().isBlank()) {
            try {
                Files.deleteIfExists(Paths.get(checklist.getFilePath()));
            } catch (IOException ignored) {}
        }
        checklist.setFilePath(null);
        checklist.setFileName(null);
        return toResponse(checklistRepository.save(checklist));
    }

    @Transactional
    public List<ChecklistResponse> initializeDefaultChecklistsForExisting(Long userId, Long contractId) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);

        // 이미 체크리스트가 있으면 기존 목록 반환
        List<Checklist> existing = checklistRepository.findByContractId(contractId);
        if (!existing.isEmpty()) {
            return existing.stream().map(this::toResponse).collect(Collectors.toList());
        }

        initializeDefaultChecklists(contract);
        return checklistRepository.findByContractIdOrderByPhaseAscCreatedAtAsc(contractId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void initializeDefaultChecklists(Contract contract) {
        // PRE_CONTRACT - 계약전
        createDefaultChecklist(contract, ContractPhase.PRE_CONTRACT, ChecklistCategory.VERIFICATION, "등기부등본 확인", "소유권, 채권, 가압류 등 확인", true);
        createDefaultChecklist(contract, ContractPhase.PRE_CONTRACT, ChecklistCategory.VERIFICATION, "건축물대장 확인", "건물의 용도, 면적, 구조 등 확인", true);
        createDefaultChecklist(contract, ContractPhase.PRE_CONTRACT, ChecklistCategory.SAFETY, "임대인 신원 확인", "신분증, 인감증명서 확인", true);
        createDefaultChecklist(contract, ContractPhase.PRE_CONTRACT, ChecklistCategory.SAFETY, "근저당권 설정 확인", "선순위 근저당 금액 확인", true);
        createDefaultChecklist(contract, ContractPhase.PRE_CONTRACT, ChecklistCategory.FINANCE, "시세 조사", "주변 시세 비교 분석", true);

        // ON_CONTRACT - 계약 시
        createDefaultChecklist(contract, ContractPhase.ON_CONTRACT, ChecklistCategory.FINANCE, "계약금 입금 확인", "계약금 송금 및 영수증 확보", true);
        createDefaultChecklist(contract, ContractPhase.ON_CONTRACT, ChecklistCategory.VERIFICATION, "특약사항 확인 및 기재", "필요한 특약사항 계약서에 명시", true);
        createDefaultChecklist(contract, ContractPhase.ON_CONTRACT, ChecklistCategory.VERIFICATION, "계약서 사본 수령", "서명된 계약서 사본 확보", true);
        createDefaultChecklist(contract, ContractPhase.ON_CONTRACT, ChecklistCategory.FINANCE, "잔금 일정 확인", "잔금 지급일 및 방법 확인", true);

        // POST_CONTRACT - 계약 후
        createDefaultChecklist(contract, ContractPhase.POST_CONTRACT, ChecklistCategory.MOVE_IN, "전입신고 완료", "주민센터에서 전입신고", true);
        createDefaultChecklist(contract, ContractPhase.POST_CONTRACT, ChecklistCategory.SAFETY, "확정일자 받기", "주민센터에서 확정일자 날인", true);
        createDefaultChecklist(contract, ContractPhase.POST_CONTRACT, ChecklistCategory.MOVE_IN, "공과금 명의 변경", "전기, 가스, 수도 등 명의 변경", true);
        createDefaultChecklist(contract, ContractPhase.POST_CONTRACT, ChecklistCategory.VERIFICATION, "시설물 상태 점검", "입주 전 시설물 상태 확인 및 사진 촬영", true);
        createDefaultChecklist(contract, ContractPhase.POST_CONTRACT, ChecklistCategory.FINANCE, "전세보험 가입", "전세보증보험 가입 검토", false);

        // MOVE_OUT - 퇴거
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.DEPOSIT_RETURN, "보증금 반환 일정 확인", "임대인과 보증금 반환 일정 협의", true);
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.DEPOSIT_RETURN, "보증금 반환 계좌 확인", "보증금 반환받을 계좌 정보 전달", true);
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.FACILITY_RESTORE, "시설물 원상복구 확인", "원상복구 필요 항목 확인 및 조치", true);
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.UTILITY_SETTLEMENT, "공과금 정산", "전기, 가스, 수도 등 공과금 최종 정산", true);
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.UTILITY_SETTLEMENT, "관리비 정산", "관리비 최종 정산 및 미납금 확인", true);
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.MOVE_OUT, "전입신고 말소", "주민센터에서 전입신고 말소 처리", true);
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.DOCUMENTATION, "퇴거 전 사진 촬영", "퇴거 전 집 상태 사진 촬영 보관", true);
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.MOVE_OUT, "열쇠 반환", "임대인에게 열쇠 반환", true);
        createDefaultChecklist(contract, ContractPhase.MOVE_OUT, ChecklistCategory.DOCUMENTATION, "퇴거 확인서 수령", "임대인으로부터 퇴거 확인서 수령", false);
    }

    private void createDefaultChecklist(Contract contract, ContractPhase phase, ChecklistCategory category,
                                         String title, String description, boolean isRequired) {
        Checklist checklist = new Checklist();
        checklist.setContract(contract);
        checklist.setPhase(phase);
        checklist.setCategory(category);
        checklist.setTitle(title);
        checklist.setDescription(description);
        checklist.setIsRequired(isRequired);
        checklist.setIsCompleted(false);
        checklistRepository.save(checklist);
    }

    private Contract getContractAndVerifyOwner(Long userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));
        if (!contract.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return contract;
    }

    private Checklist getChecklistAndVerifyOwner(Long userId, Long checklistId) {
        Checklist checklist = checklistRepository.findById(checklistId)
                .orElseThrow(() -> new IllegalArgumentException("Checklist not found with id: " + checklistId));
        if (!checklist.getContract().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return checklist;
    }

    private ChecklistResponse toResponse(Checklist checklist) {
        ChecklistResponse response = new ChecklistResponse();
        response.setId(checklist.getId());
        response.setContractId(checklist.getContract().getId());
        response.setPhase(checklist.getPhase());
        response.setCategory(checklist.getCategory());
        response.setTitle(checklist.getTitle());
        response.setDescription(checklist.getDescription());
        response.setIsRequired(checklist.getIsRequired());
        response.setIsCompleted(checklist.getIsCompleted());
        response.setCompletedAt(checklist.getCompletedAt());
        response.setFilePath(checklist.getFilePath());
        response.setFileName(checklist.getFileName());
        response.setCreatedAt(checklist.getCreatedAt());
        return response;
    }
}
