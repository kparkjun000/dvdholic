package fast.campus.netplix.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * SPA 클라이언트 라우트 요청 시 index.html로 포워드 (리소스 핸들러 보조).
 */
@Controller
public class SpaForwardController {

    @GetMapping({
            "",
            "/",
            "/login",
            "/signup",
            "/dashboard",
            "/main",
            "/login/oauth2/code/kakao"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
