package com.starter.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private final OAuth2 oauth2 = new OAuth2();
    private final Auth auth = new Auth();

    @Getter
    @Setter
    public static class OAuth2 {
        private String authorizedRedirectUri;
    }

    @Getter
    @Setter
    public static class Auth {
        private String accessCookieName = "access_token";
        private String refreshCookieName = "refresh_token";
        private String cookieSameSite = "Lax";
        private boolean cookieSecure = false;
    }
}
