package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.DepositSource;
import com.starter.domain.Payment;
import com.starter.domain.User;
import com.starter.dto.request.ContractCreateRequest;
import com.starter.dto.response.ContractResponse;
import com.starter.dto.response.DepositSourceResponse;
import com.starter.enums.PaymentCategory;
import com.starter.enums.PaymentStatus;
import com.starter.repository.ContractRepository;
import com.starter.repository.DepositSourceRepository;
import com.starter.repository.UserRepository;
import com.starter.repository.ChecklistRepository;
import com.starter.repository.DocumentRepository;
import com.starter.repository.PaymentRepository;
import com.starter.repository.SpecialTermRepository;
import com.starter.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

    private final ContractRepository contractRepository;
    private final DepositSourceRepository depositSourceRepository;
    private final UserRepository userRepository;
    private final ChecklistRepository checklistRepository;
    private final DocumentRepository documentRepository;
    private final SpecialTermRepository specialTermRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final PaymentRepository paymentRepository;
    @Lazy
    private final ChecklistService checklistService;

    @Transactional
    public ContractResponse createContract(Long userId, ContractCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Contract contract = new Contract();
        contract.setUser(user);
        contract.setType(request.getType());
        contract.setAddress(request.getAddress());
        contract.setJeonseDeposit(request.getJeonseDeposit());
        contract.setMonthlyRent(request.getMonthlyRent());
        contract.setMaintenanceFee(request.getMaintenanceFee());
        contract.setMonthlyPaymentDay(request.getMonthlyPaymentDay());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());

        Contract savedContract = contractRepository.save(contract);

        if (request.getDepositSources() != null) {
            request.getDepositSources().forEach(dsReq -> {
                DepositSource ds = new DepositSource();
                ds.setContract(savedContract);
                ds.setType(dsReq.getType());
                ds.setAmount(dsReq.getAmount());
                ds.setBankName(dsReq.getBankName());
                ds.setInterestRate(dsReq.getInterestRate());
                depositSourceRepository.save(ds);
            });
        }

        // 기본 체크리스트 초기화
        checklistService.initializeDefaultChecklists(savedContract);
        syncContractPayments(
                user,
                savedContract.getId(),
                request.getMonthlyRent(),
                request.getMaintenanceFee(),
                request.getMonthlyPaymentDay()
        );

        return toResponse(savedContract);
    }

    public List<ContractResponse> getContractsByUserId(Long userId) {
        return contractRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ContractResponse getContract(Long userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));
        if (!contract.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return toResponse(contract);
    }

    @Transactional
    public ContractResponse updateContract(Long userId, Long contractId, ContractCreateRequest request) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));
        if (!contract.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        contract.setType(request.getType());
        contract.setAddress(request.getAddress());
        contract.setJeonseDeposit(request.getJeonseDeposit());
        contract.setMonthlyRent(request.getMonthlyRent());
        contract.setMaintenanceFee(request.getMaintenanceFee());
        contract.setMonthlyPaymentDay(request.getMonthlyPaymentDay());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());

        Contract saved = contractRepository.save(contract);
        syncContractPayments(
                contract.getUser(),
                contract.getId(),
                request.getMonthlyRent(),
                request.getMaintenanceFee(),
                request.getMonthlyPaymentDay()
        );
        return toResponse(saved);
    }

    @Transactional
    public void deleteContract(Long userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));
        if (!contract.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        // 연관 데이터 먼저 삭제
        checklistRepository.deleteByContractId(contractId);
        documentRepository.deleteByContractId(contractId);
        specialTermRepository.deleteByContractId(contractId);
        maintenanceRepository.deleteByContractId(contractId);
        depositSourceRepository.deleteByContractId(contractId);
        paymentRepository.deleteByUserIdAndSourceTypeAndSourceId(userId, "CONTRACT", contractId);

        contractRepository.delete(contract);
    }

    private void syncContractPayments(
            User user,
            Long contractId,
            BigDecimal monthlyRent,
            BigDecimal maintenanceFee,
            Integer monthlyPaymentDay
    ) {
        List<Payment> existing = paymentRepository.findByUserIdAndSourceTypeAndSourceId(user.getId(), "CONTRACT", contractId);
        syncContractPaymentByCategory(existing, user, contractId, PaymentCategory.RENT, "월세", monthlyRent, monthlyPaymentDay);
        syncContractPaymentByCategory(existing, user, contractId, PaymentCategory.MAINTENANCE, "관리비", maintenanceFee, monthlyPaymentDay);
    }

    private void syncContractPaymentByCategory(
            List<Payment> existing,
            User user,
            Long contractId,
            PaymentCategory category,
            String name,
            BigDecimal amount,
            Integer monthlyPaymentDay
    ) {
        List<Payment> payments = existing.stream()
                .filter(payment -> payment.getCategory() == category)
                .collect(Collectors.toList());

        int resolvedPaymentDay = (monthlyPaymentDay != null && monthlyPaymentDay >= 1 && monthlyPaymentDay <= 31)
                ? monthlyPaymentDay
                : 25;

        boolean hasAmount = amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
        if (!hasAmount) {
            payments.forEach(paymentRepository::delete);
            return;
        }

        Payment target;
        if (payments.isEmpty()) {
            target = Payment.builder()
                    .user(user)
                    .name(name)
                    .category(category)
                    .amount(amount)
                    .paymentDay(resolvedPaymentDay)
                    .isRecurring(true)
                    .autoPay(false)
                    .status(PaymentStatus.UPCOMING)
                    .sourceType("CONTRACT")
                    .sourceId(contractId)
                    .build();
        } else {
            target = payments.get(0);
            target.setName(name);
            target.setAmount(amount);
            target.setIsRecurring(true);
            target.setSourceType("CONTRACT");
            target.setSourceId(contractId);
            target.setPaymentDay(resolvedPaymentDay);
            if (target.getStatus() == null) {
                target.setStatus(PaymentStatus.UPCOMING);
            }
            if (target.getAutoPay() == null) {
                target.setAutoPay(false);
            }
            if (payments.size() > 1) {
                payments.stream().skip(1).forEach(paymentRepository::delete);
            }
        }

        paymentRepository.save(target);
    }

    private ContractResponse toResponse(Contract contract) {
        ContractResponse response = new ContractResponse();
        response.setId(contract.getId());
        response.setType(contract.getType());
        response.setAddress(contract.getAddress());
        response.setJeonseDeposit(contract.getJeonseDeposit());
        response.setMonthlyRent(contract.getMonthlyRent());
        response.setMaintenanceFee(contract.getMaintenanceFee());
        response.setMonthlyPaymentDay(contract.getMonthlyPaymentDay());
        response.setStartDate(contract.getStartDate());
        response.setEndDate(contract.getEndDate());
        response.setCreatedAt(contract.getCreatedAt());

        List<DepositSource> sources = depositSourceRepository.findByContractId(contract.getId());
        response.setDepositSources(sources.stream().map(ds -> {
            DepositSourceResponse dsr = new DepositSourceResponse();
            dsr.setId(ds.getId());
            dsr.setType(ds.getType());
            dsr.setAmount(ds.getAmount());
            dsr.setBankName(ds.getBankName());
            dsr.setInterestRate(ds.getInterestRate());
            return dsr;
        }).collect(Collectors.toList()));

        return response;
    }
}
