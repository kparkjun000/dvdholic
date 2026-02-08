package fast.campus.netplix.movie;

import fast.campus.netplix.movie.download.UserMovieDownloadRoleValidator;
import fast.campus.netplix.movie.response.MoviePageableResponse;
import fast.campus.netplix.movie.response.MovieResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieService implements FetchMovieUseCase, InsertMovieUseCase, DownloadMovieUseCase {

    private final List<UserMovieDownloadRoleValidator> userMovieDownloadRoleValidators;
    private final DownloadMoviePort downloadMoviePort;
    private final TmdbMoviePort tmdbMoviePort;
    private final PersistenceMoviePort persistenceMoviePort;

    @Override
    public MoviePageableResponse fetchFromClient(int page) {
        NetplixPageableMovies movies = tmdbMoviePort.fetchPageable(page);
        return new MoviePageableResponse(movies.getNetplixMovies(), page, movies.isHasNext());
    }

    @Override
    public MoviePageableResponse fetchFromDb(int page) {
        int pageSize = 20;
        
        // Fetch pageSize + 1 to check if there's a next page
        List<NetplixMovie> netplixMovies = persistenceMoviePort.fetchBy(page, pageSize + 1);
        
        // Check if there's a next page
        boolean hasNext = netplixMovies.size() > pageSize;
        
        // Return only pageSize items
        List<NetplixMovie> resultMovies = hasNext 
            ? netplixMovies.subList(0, pageSize) 
            : netplixMovies;
        
        return new MoviePageableResponse(resultMovies, page, hasNext);
    }

    @Override
    public void insert(List<NetplixMovie> movies) {
        movies.forEach(persistenceMoviePort::insert);
    }

    @Override
    public MovieResponse download(String userId, String role, String name) {
        long downloadCnt = downloadMoviePort.downloadCntToday(userId);
        boolean validate = userMovieDownloadRoleValidators.stream()
                .filter(validator -> validator.isTarget(role))
                .findFirst()
                .orElseThrow()
                .validate(downloadCnt);

        if (!validate) {
            throw new RuntimeException("No more downloads available today.");
        }

        NetplixMovie netplixMovie = persistenceMoviePort.findBy(name);

        downloadMoviePort.save(UserMovieDownload.newDownload(userId, name));

        return new MovieResponse(netplixMovie.getMovieName(), downloadCnt);
    }
}
