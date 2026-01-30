package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.User;
import com.starter.dto.request.ContractCreateRequest;
import com.starter.dto.response.ContractResponse;
import com.starter.repository.ContractRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

    private final ContractRepository contractRepository;
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
        
        // This is a simplified response, we need to map entities to DTOs
        return new ContractResponse(); 
    }
}
