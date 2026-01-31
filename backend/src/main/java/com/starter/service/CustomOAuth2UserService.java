package com.starter.service;

import com.starter.domain.User;
import com.starter.enums.AuthProvider;
import com.starter.enums.Role;
import com.starter.repository.UserRepository;
import com.starter.security.UserPrincipal;
import com.starter.security.oauth2.OAuth2UserInfo;
import com.starter.security.oauth2.OAuth2UserInfoFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String email = oAuth2UserInfo.getEmail();
        if (!StringUtils.hasText(email)) {
            email = registrationId + "_" + oAuth2UserInfo.getId();
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getProvider().equalsIgnoreCase(AuthProvider.valueOf(registrationId).toString())) {
                // 같은 이메일, 다른 provider → 기존 계정에 provider 연동
                user.setProvider(registrationId);
                user.setProviderId(oAuth2UserInfo.getId());
            }
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            user = registerNewUser(userRequest, oAuth2UserInfo, email);
        }

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo, String email) {
        return userRepository.save(User.builder()
                .provider(oAuth2UserRequest.getClientRegistration().getRegistrationId())
                .providerId(oAuth2UserInfo.getId())
                .name(oAuth2UserInfo.getName())
                .email(email)
                .role(Role.USER)
                .build());
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        existingUser.setName(oAuth2UserInfo.getName());
        return userRepository.save(existingUser);
    }
}
