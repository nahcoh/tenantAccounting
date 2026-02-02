package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.DepositSource;
import com.starter.domain.User;
import com.starter.dto.request.ContractCreateRequest;
import com.starter.dto.response.ContractResponse;
import com.starter.dto.response.DepositSourceResponse;
import com.starter.repository.ContractRepository;
import com.starter.repository.DepositSourceRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());

        Contract saved = contractRepository.save(contract);
        return toResponse(saved);
    }

    @Transactional
    public void deleteContract(Long userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));
        if (!contract.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        contractRepository.delete(contract);
    }

    private ContractResponse toResponse(Contract contract) {
        ContractResponse response = new ContractResponse();
        response.setId(contract.getId());
        response.setType(contract.getType());
        response.setAddress(contract.getAddress());
        response.setJeonseDeposit(contract.getJeonseDeposit());
        response.setMonthlyRent(contract.getMonthlyRent());
        response.setMaintenanceFee(contract.getMaintenanceFee());
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
