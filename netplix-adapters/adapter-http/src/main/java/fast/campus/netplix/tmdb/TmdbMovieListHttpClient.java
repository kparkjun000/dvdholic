package fast.campus.netplix.tmdb;

import fast.campus.netplix.client.TmdbHttpClient;
import fast.campus.netplix.movie.NetplixPageableMovies;
import fast.campus.netplix.movie.TmdbMoviePort;
import fast.campus.netplix.util.ObjectMapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TmdbMovieListHttpClient implements TmdbMoviePort {
    @Value("${tmdb.api.movie-lists.now-playing}")
    private String nowPlaying;

    private final TmdbHttpClient tmdbHttpClient;

    @Override
    public NetplixPageableMovies fetchPageable(int page) {
        String url = nowPlaying + "&language=ko-KR&page=" + page;
        String request = tmdbHttpClient.request(url, HttpMethod.GET, CollectionUtils.toMultiValueMap(Map.of()), Map.of());

        TmdbResponse object = ObjectMapperUtil.toObject(request, TmdbResponse.class);

        // Filter movies with Korean overview only
        List<TmdbMovieNowPlaying> koreanMovies = object.getResults().stream()
                .filter(TmdbMovieNowPlaying::hasKoreanOverview)
                .collect(Collectors.toList());

        return new NetplixPageableMovies(
                koreanMovies.stream().map(TmdbMovieNowPlaying::toDomain).toList(),
                Integer.parseInt(object.getPage()),
                (Integer.parseInt(object.getTotal_pages())) - page != 0
        );
    }
}
