package fast.campus.netplix.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * SPA 클라이언트 라우트 요청 시 index.html로 포워드.
 * index.html이 없을 때 forward하면 500이 나므로, 있을 때만 forward하고 없으면 404.
 */
@Controller
public class SpaForwardController {

    private final ResourceLoader resourceLoader;

    public SpaForwardController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @GetMapping({
            "",
            "/",
            "/login",
            "/signup",
            "/dashboard",
            "/main",
            "/login/oauth2/code/kakao"
    })
    public Object forwardToIndex() {
        Resource index = resourceLoader.getResource("classpath:/static/index.html");
        if (index.exists() && index.isReadable()) {
            return "forward:/index.html";
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_HTML_VALUE)
                .body("<!DOCTYPE html><html><body><h1>404 Not Found</h1><p>Frontend not built. Deploy with Node buildpack + Gradle stage.</p></body></html>");
    }
}
