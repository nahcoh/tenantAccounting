package com.starter.security.oauth2;

import com.starter.config.AppProperties;
import com.starter.utils.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HttpCookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";
    private static final int cookieExpireSeconds = 180;
    private final AppProperties appProperties;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return CookieUtils.getCookie(request, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME)
                .map(cookie -> CookieUtils.deserialize(cookie, OAuth2AuthorizationRequest.class))
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            deleteOAuth2Cookies(response);
            return;
        }

        CookieUtils.addCookie(
                response,
                OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME,
                CookieUtils.serialize(authorizationRequest),
                cookieExpireSeconds,
                true,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                appProperties.getAuth().getCookieDomain()
        );
        String redirectUriAfterLogin = request.getParameter(REDIRECT_URI_PARAM_COOKIE_NAME);
        if (redirectUriAfterLogin != null && !redirectUriAfterLogin.isEmpty()) {
            CookieUtils.addCookie(
                    response,
                    REDIRECT_URI_PARAM_COOKIE_NAME,
                    redirectUriAfterLogin,
                    cookieExpireSeconds,
                    true,
                    appProperties.getAuth().isCookieSecure(),
                    appProperties.getAuth().getCookieSameSite(),
                    appProperties.getAuth().getCookieDomain()
            );
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        return this.loadAuthorizationRequest(request);
    }

    public void removeAuthorizationRequestCookies(HttpServletRequest request, HttpServletResponse response) {
        deleteOAuth2Cookies(response);
    }

    private void deleteOAuth2Cookies(HttpServletResponse response) {
        CookieUtils.deleteCookie(
                response,
                OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                appProperties.getAuth().getCookieDomain()
        );
        CookieUtils.deleteCookie(
                response,
                REDIRECT_URI_PARAM_COOKIE_NAME,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                appProperties.getAuth().getCookieDomain()
        );
        CookieUtils.deleteCookie(
                response,
                OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                null
        );
        CookieUtils.deleteCookie(
                response,
                REDIRECT_URI_PARAM_COOKIE_NAME,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite(),
                null
        );
    }
}
