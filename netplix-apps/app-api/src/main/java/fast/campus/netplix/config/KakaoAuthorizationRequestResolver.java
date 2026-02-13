package fast.campus.netplix.config;

import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.util.CollectionUtils;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 카카오 로그인 시 동의/로그인 화면을 항상 보여주기 위해 authorization 요청에 prompt=login 추가.
 * @see <a href="https://developers.kakao.com/docs/latest/ko/kakaologin/common">카카오 로그인</a>
 */
public final class KakaoAuthorizationRequestResolver
        extends org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver {

    private static final String KAKAO_REGISTRATION_ID = "kakao";
    private static final String PROMPT_LOGIN = "login";

    public KakaoAuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository,
                                            String authorizationRequestBaseUri) {
        super(clientRegistrationRepository, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest authRequest = super.resolve(request);
        if (authRequest == null) {
            return null;
        }
        if (KAKAO_REGISTRATION_ID.equals(authRequest.getClientRegistration().getRegistrationId())) {
            return withPrompt(authRequest, PROMPT_LOGIN);
        }
        return authRequest;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest authRequest = super.resolve(request, clientRegistrationId);
        if (authRequest == null) {
            return null;
        }
        if (KAKAO_REGISTRATION_ID.equals(clientRegistrationId)) {
            return withPrompt(authRequest, PROMPT_LOGIN);
        }
        return authRequest;
    }

    private static OAuth2AuthorizationRequest withPrompt(OAuth2AuthorizationRequest request, String prompt) {
        Map<String, Object> additionalParams = new HashMap<>(
                request.getAdditionalParameters() != null ? request.getAdditionalParameters() : Map.of());
        additionalParams.put("prompt", prompt);

        return OAuth2AuthorizationRequest.from(request)
                .additionalParameters(additionalParams)
                .build();
    }
}
