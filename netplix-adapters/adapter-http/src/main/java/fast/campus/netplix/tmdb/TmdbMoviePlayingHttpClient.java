package fast.campus.netplix.tmdb;

import fast.campus.netplix.client.TmdbHttpClient;
import fast.campus.netplix.movie.NetplixMovie;
import fast.campus.netplix.movie.NetplixPageableMovies;
import fast.campus.netplix.movie.TmdbMoviePlayingPort;
import fast.campus.netplix.util.ObjectMapperUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class TmdbMoviePlayingHttpClient implements TmdbMoviePlayingPort {
    @Value("${tmdb.api.movie-lists.movie-playing}")
    private String moviePlaying;

    /** false = 빠른 모드(리스트만, 페이지당 1회 호출), true = Enrich(영화당 6회 호출) */
    @Value("${tmdb.batch.movie.enrich:false}")
    private boolean enrich;

    /** TMDB에서 응답 지연/멈춤으로 배치가 걸리는 ID → Enrich 스킵 (enrich=true일 때만 사용) */
    private static final Set<Integer> SKIP_ENRICH_TMDB_IDS = Set.of(1476682, 1356587, 1597535);

    private final TmdbHttpClient tmdbHttpClient;
    private final TmdbMovieDetailsHttpClient tmdbMovieDetailsHttpClient;

    @Override
    public NetplixPageableMovies fetchPageable(int page) {
        // TMDB API는 page가 1부터 시작하므로 +1 처리
        String url = moviePlaying + "&language=ko-KR&page=" + (page + 1);
        String request = tmdbHttpClient.request(url, HttpMethod.GET, CollectionUtils.toMultiValueMap(Map.of()), Map.of());

        TmdbResponse object = ObjectMapperUtil.toObject(request, TmdbResponse.class);

        List<NetplixMovie> movies = enrich
                ? object.getResults().stream()
                        .map(tmdbMovie -> enrichMovieDetails(tmdbMovie.toDomain(), tmdbMovie.getTmdbId()))
                        .toList()
                : object.getResults().stream()
                        .map(tmdbMovie -> withContentType(tmdbMovie.toDomain(), "movie"))
                        .toList();

        return new NetplixPageableMovies(
                movies,
                Integer.parseInt(object.getPage()),
                (Integer.parseInt(object.getTotal_pages())) - page != 0
        );
    }

    @Override
    public NetplixMovie enrichMovieDetails(NetplixMovie movie, Integer tmdbId) {
        if (tmdbId != null && SKIP_ENRICH_TMDB_IDS.contains(tmdbId)) {
            log.info("→ Skipping enrich for tmdbId: {} (known slow/hang)", tmdbId);
            return movie;
        }
        log.info("→ Enriching movie: {} (tmdbId: {})", movie.getMovieName(), tmdbId);

        try {
            TmdbCredits credits = tmdbMovieDetailsHttpClient.fetchMovieCredits(tmdbId);
            TmdbMovieDetails details = tmdbMovieDetailsHttpClient.fetchMovieDetails(tmdbId);
            String trailerUrl = tmdbMovieDetailsHttpClient.fetchMovieTrailer(tmdbId);
            String ottProviders = tmdbMovieDetailsHttpClient.fetchOttProviders(tmdbId);
            String recommendations = tmdbMovieDetailsHttpClient.fetchRecommendations(tmdbId);
            String topReview = tmdbMovieDetailsHttpClient.fetchTopReview(tmdbId);
            String collection = details != null ? details.getCollectionName() : null;

            NetplixMovie enriched = NetplixMovie.builder()
                    .movieName(movie.getMovieName())
                    .isAdult(movie.getIsAdult())
                    .genre(movie.getGenre())
                    .overview(movie.getOverview())
                    .releasedAt(movie.getReleasedAt())
                    .posterPath(movie.getPosterPath())
                    .backdropPath(movie.getBackdropPath())
                    .voteAverage(movie.getVoteAverage())
                    .cast(credits != null ? credits.getTopCast(5) : null)
                    .director(credits != null ? credits.getDirector() : null)
                    .runtime(details != null ? details.getRuntime() : null)
                    .releaseDate(movie.getReleaseDate())
                    .certification(null)
                    .budget(details != null ? details.getBudget() : null)
                    .revenue(details != null ? details.getRevenue() : null)
                    .contentType("movie")
                    .trailerUrl(trailerUrl)
                    .ottProviders(ottProviders)
                    .collection(collection)
                    .recommendations(recommendations)
                    .topReview(topReview)
                    .build();

            log.info("✓ Enriched movie: {}", movie.getMovieName());
            return enriched;
        } catch (Exception e) {
            log.error("✗ Failed to enrich movie: {} - {}", movie.getMovieName(), e.getMessage());
            return movie;
        }
    }

    /** 빠른 모드: 리스트 API 응답만으로 NetplixMovie 생성 (contentType만 설정) */
    private static NetplixMovie withContentType(NetplixMovie m, String contentType) {
        return NetplixMovie.builder()
                .movieName(m.getMovieName())
                .isAdult(m.getIsAdult())
                .genre(m.getGenre())
                .overview(m.getOverview())
                .releasedAt(m.getReleasedAt())
                .posterPath(m.getPosterPath())
                .backdropPath(m.getBackdropPath())
                .voteAverage(m.getVoteAverage())
                .cast(m.getCast())
                .director(m.getDirector())
                .runtime(m.getRuntime())
                .releaseDate(m.getReleaseDate())
                .certification(m.getCertification())
                .budget(m.getBudget())
                .revenue(m.getRevenue())
                .contentType(contentType)
                .trailerUrl(m.getTrailerUrl())
                .ottProviders(m.getOttProviders())
                .collection(m.getCollection())
                .recommendations(m.getRecommendations())
                .topReview(m.getTopReview())
                .build();
    }
}
