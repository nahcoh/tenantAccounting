package com.starter.service;

import com.starter.repository.UtilityRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UtilityService {

    private final UtilityRepository utilityRepository;
    private final UserRepository userRepository;

    // Methods for utility management to be implemented
}
