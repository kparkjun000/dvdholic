package fast.campus.netplix.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway 실패 이력 수정: FLYWAY_REPAIR=true 일 때 시작 전 repair 실행.
 * (Heroku 등에서 "Detected failed migration" 발생 시 한 번만 설정 후 재시작)
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            if ("true".equalsIgnoreCase(System.getenv("FLYWAY_REPAIR"))) {
                flyway.repair();
            }
            flyway.migrate();
        };
    }
}
