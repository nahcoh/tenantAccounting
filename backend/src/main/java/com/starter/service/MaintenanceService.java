package com.starter.service;

import com.starter.repository.MaintenanceRecordRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final UserRepository userRepository;

    // Methods for maintenance record management to be implemented
}
