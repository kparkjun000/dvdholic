package fast.campus.netplix.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * SPA(React) 배포 시 클라이언트 라우트(/login, /dashboard 등) 요청에 index.html 서빙.
 * index.html이 없을 때 null을 반환하면 500이 나므로, 폴백 리졸버는 정적 파일이 있을 때만 등록.
 */
@Configuration
public class SpaResourceConfig implements WebMvcConfigurer {

    private final ResourceLoader resourceLoader;

    public SpaResourceConfig(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        var registration = registry
                .addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");

        Resource indexHtml = resourceLoader.getResource("classpath:/static/index.html");
        if (indexHtml.exists() && indexHtml.isReadable()) {
            registration.resourceChain(true)
                    .addResolver(new PathResourceResolver() {
                        @Override
                        protected Resource getResource(String resourcePath, Resource location) throws IOException {
                            if (resourcePath == null || resourcePath.isEmpty() || resourcePath.equals("/")) {
                                Resource index = getIndexHtml(location);
                                return index != null ? index : super.getResource(resourcePath, location);
                            }
                            Resource resource = location.createRelative(resourcePath);
                            if (resource.exists() && resource.isReadable()) {
                                return resource;
                            }
                            Resource index = getIndexHtml(location);
                            return index != null ? index : super.getResource(resourcePath, location);
                        }

                        private Resource getIndexHtml(Resource location) throws IOException {
                            Resource index = location.createRelative("index.html");
                            return (index.exists() && index.isReadable()) ? index : null;
                        }
                    });
        }
    }
}
