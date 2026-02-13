package fast.campus.netplix.config;

import fast.campus.netplix.auth.UpdateTokenUseCase;
import fast.campus.netplix.auth.response.TokenResponse;
import fast.campus.netplix.user.FetchUserUseCase;
import fast.campus.netplix.user.RegisterUserUseCase;
import fast.campus.netplix.user.command.SocialUserRegistrationCommand;
import fast.campus.netplix.user.response.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

/**
 * 카카오 OAuth2 로그인 성공 시 JWT 발급 후 /dashboard 로 리다이렉트 (쿼리 파라미터로 토큰 전달).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UpdateTokenUseCase updateTokenUseCase;
    private final FetchUserUseCase fetchUserUseCase;
    private final RegisterUserUseCase registerUserUseCase;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        // Kakao: user-name-attribute=id → getName()이 카카오 회원번호(providerId)
        String providerId = oauth2User.getName();
        String name = resolveName(oauth2User);

        UserResponse existing = fetchUserUseCase.findByProviderId(providerId);
        if (ObjectUtils.isEmpty(existing)) {
            registerUserUseCase.registerSocialUser(
                    new SocialUserRegistrationCommand(name, "kakao", providerId));
        }

        TokenResponse tokens = updateTokenUseCase.upsertToken(providerId);
        String redirectUrl = UriComponentsBuilder.fromPath("/dashboard")
                .queryParam("token", tokens.accessToken())
                .queryParam("refresh_token", tokens.refreshToken() != null ? tokens.refreshToken() : "")
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private String resolveName(OAuth2User oauth2User) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> properties = (Map<String, Object>) oauth2User.getAttribute("properties");
            if (properties != null && properties.get("nickname") != null) {
                return String.valueOf(properties.get("nickname"));
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> kakaoAccount = (Map<String, Object>) oauth2User.getAttribute("kakao_account");
            if (kakaoAccount != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                if (profile != null && profile.get("nickname") != null) {
                    return String.valueOf(profile.get("nickname"));
                }
            }
        } catch (Exception e) {
            log.debug("OAuth2 name resolve fallback", e);
        }
        return "카카오사용자";
    }
}
