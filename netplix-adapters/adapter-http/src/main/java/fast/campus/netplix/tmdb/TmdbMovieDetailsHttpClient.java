package fast.campus.netplix.tmdb;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class TmdbMovieDetailsHttpClient {
    private final ObjectMapper objectMapper;

    @Value("${tmdb.api.movie-details}")
    private String movieDetailsUrl;

    @Value("${tmdb.api.movie-credits}")
    private String movieCreditsUrl;

    @Value("${tmdb.api.movie-release-dates}")
    private String movieReleaseDatesUrl;

    private RestClient createRestClientWithTimeout() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000); // 2 seconds
        factory.setReadTimeout(2000); // 2 seconds
        
        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    public TmdbMovieDetails fetchMovieDetails(Integer movieId) {
        try {
            log.debug("→ Fetching details for movieId: {}", movieId);
            String url = movieDetailsUrl.replace("{movie_id}", String.valueOf(movieId));
            String response = createRestClientWithTimeout()
                    .get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            TmdbMovieDetails result = objectMapper.readValue(response, TmdbMovieDetails.class);
            log.debug("✓ Details fetched for movieId: {}", movieId);
            return result;
        } catch (Exception e) {
            log.warn("✗ Failed to fetch details for movieId: {} - {}", movieId, e.getMessage());
            return null;
        }
    }

    public TmdbCredits fetchMovieCredits(Integer movieId) {
        try {
            log.debug("→ Fetching credits for movieId: {}", movieId);
            String url = movieCreditsUrl.replace("{movie_id}", String.valueOf(movieId));
            String response = createRestClientWithTimeout()
                    .get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            TmdbCredits result = objectMapper.readValue(response, TmdbCredits.class);
            log.debug("✓ Credits fetched for movieId: {}", movieId);
            return result;
        } catch (Exception e) {
            log.warn("✗ Failed to fetch credits for movieId: {} - {}", movieId, e.getMessage());
            return null;
        }
    }

    // Certification API removed - too slow and causes batch to hang
}
