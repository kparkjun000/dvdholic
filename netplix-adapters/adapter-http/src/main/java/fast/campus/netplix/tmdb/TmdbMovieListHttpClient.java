package fast.campus.netplix.tmdb;

import fast.campus.netplix.client.TmdbHttpClient;
import fast.campus.netplix.movie.NetplixMovie;
import fast.campus.netplix.movie.NetplixPageableMovies;
import fast.campus.netplix.movie.TmdbMoviePort;
import fast.campus.netplix.util.ObjectMapperUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class TmdbMovieListHttpClient implements TmdbMoviePort {
    @Value("${tmdb.api.movie-lists.now-playing}")
    private String nowPlaying;

    private final TmdbHttpClient tmdbHttpClient;
    private final TmdbMovieDetailsHttpClient tmdbMovieDetailsHttpClient;

    @Override
    public NetplixPageableMovies fetchPageable(int page) {
        String url = nowPlaying + "&language=ko-KR&page=" + page;
        String request = tmdbHttpClient.request(url, HttpMethod.GET, CollectionUtils.toMultiValueMap(Map.of()), Map.of());

        TmdbResponse object = ObjectMapperUtil.toObject(request, TmdbResponse.class);

        // Enrich each movie with detailed information
        List<NetplixMovie> enrichedMovies = object.getResults().stream()
                .map(tmdbMovie -> {
                    NetplixMovie basicMovie = tmdbMovie.toDomain();
                    return enrichMovieDetails(basicMovie, tmdbMovie.getTmdbId());
                })
                .toList();

        return new NetplixPageableMovies(
                enrichedMovies,
                Integer.parseInt(object.getPage()),
                (Integer.parseInt(object.getTotal_pages())) - page != 0
        );
    }

    @Override
    public NetplixMovie enrichMovieDetails(NetplixMovie movie, Integer tmdbId) {
        log.info("→ Enriching movie: {} (tmdbId: {})", movie.getMovieName(), tmdbId);
        
        try {
            // Fetch credits (cast, director) - Most important
            TmdbCredits credits = tmdbMovieDetailsHttpClient.fetchMovieCredits(tmdbId);
            
            // Fetch movie details (runtime, budget, revenue)
            TmdbMovieDetails details = tmdbMovieDetailsHttpClient.fetchMovieDetails(tmdbId);
            
            // Build enriched movie (skip certification - too slow)
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
                    .certification(null) // Skip certification (too slow)
                    .budget(details != null ? details.getBudget() : null)
                    .revenue(details != null ? details.getRevenue() : null)
                    .build();
                    
            log.info("✓ Enriched movie: {}", movie.getMovieName());
            return enriched;
        } catch (Exception e) {
            log.error("✗ Failed to enrich movie: {} - {}", movie.getMovieName(), e.getMessage());
            return movie;
        }
    }
}
