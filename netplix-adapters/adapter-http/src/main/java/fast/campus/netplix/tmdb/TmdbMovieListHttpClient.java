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
    @Value("${tmdb.api.movie-lists.popular}")
    private String popularUrl;

    private final TmdbHttpClient tmdbHttpClient;
    private final TmdbMovieDetailsHttpClient tmdbMovieDetailsHttpClient;

    @Override
    public NetplixPageableMovies fetchPageable(int page) {
        // TMDB API는 page가 1부터 시작하므로 +1 처리 (DVD = 인기 영화 목록)
        String url = popularUrl + "&language=ko-KR&page=" + (page + 1);
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
            // Fetch credits (cast, director)
            TmdbCredits credits = tmdbMovieDetailsHttpClient.fetchMovieCredits(tmdbId);
            
            // Fetch movie details (runtime, budget, revenue, collection)
            TmdbMovieDetails details = tmdbMovieDetailsHttpClient.fetchMovieDetails(tmdbId);
            
            // Fetch additional information
            String trailerUrl = tmdbMovieDetailsHttpClient.fetchMovieTrailer(tmdbId);
            String ottProviders = tmdbMovieDetailsHttpClient.fetchOttProviders(tmdbId);
            String recommendations = tmdbMovieDetailsHttpClient.fetchRecommendations(tmdbId);
            String topReview = tmdbMovieDetailsHttpClient.fetchTopReview(tmdbId);
            String collection = details != null ? details.getCollectionName() : null;
            
            // Build enriched movie
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
                    .contentType("dvd")  // DVD 컨텐츠
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
}
