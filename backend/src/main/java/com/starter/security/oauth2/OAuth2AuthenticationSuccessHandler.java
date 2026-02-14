package com.starter.security.oauth2;

import com.starter.config.AppProperties;
import com.starter.security.JwtTokenProvider;
import com.starter.utils.CookieUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final AppProperties appProperties;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    public OAuth2AuthenticationSuccessHandler(
            JwtTokenProvider tokenProvider,
            AppProperties appProperties,
            HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository) {
        this.tokenProvider = tokenProvider;
        this.appProperties = appProperties;
        this.httpCookieOAuth2AuthorizationRequestRepository = httpCookieOAuth2AuthorizationRequestRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        String targetUrl = appProperties.getOauth2().getAuthorizedRedirectUri();

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication.getName());

        int accessTokenMaxAge = (int) (tokenProvider.getAccessTokenExpiration() / 1000);
        int refreshTokenMaxAge = (int) (tokenProvider.getRefreshTokenExpiration() / 1000);
        CookieUtils.addCookie(
                response,
                appProperties.getAuth().getAccessCookieName(),
                accessToken,
                accessTokenMaxAge,
                true,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite()
        );
        CookieUtils.addCookie(
                response,
                appProperties.getAuth().getRefreshCookieName(),
                refreshToken,
                refreshTokenMaxAge,
                true,
                appProperties.getAuth().isCookieSecure(),
                appProperties.getAuth().getCookieSameSite()
        );

        if (redisTemplate != null) {
            try {
                long refreshTokenExpiration = tokenProvider.getRefreshTokenExpiration();
                redisTemplate.opsForValue().set("RT:" + authentication.getName(), refreshToken, refreshTokenExpiration, TimeUnit.MILLISECONDS);
            } catch (Exception e) {
                logger.warn("Redis unavailable, skipping refresh token storage: " + e.getMessage());
            }
        }

        return targetUrl;
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    }
}
