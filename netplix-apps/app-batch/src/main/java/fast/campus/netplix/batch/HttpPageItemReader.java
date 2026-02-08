package fast.campus.netplix.batch;

import fast.campus.netplix.movie.FetchMovieUseCase;
import fast.campus.netplix.movie.NetplixMovie;
import fast.campus.netplix.movie.response.MoviePageableResponse;
import org.springframework.batch.item.support.AbstractItemCountingItemStreamItemReader;

import java.util.LinkedList;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Queue;

public class HttpPageItemReader extends AbstractItemCountingItemStreamItemReader<NetplixMovie> {

    private int page;
    private final List<NetplixMovie> contents = new LinkedList<>();
    private boolean hasNext = true;
    private static final int MAX_PAGE = 500; // TMDB API 최대 페이지

    private final FetchMovieUseCase fetchMovieUseCase;

    public HttpPageItemReader(int page, FetchMovieUseCase fetchMovieUseCase) {
        this.page = page;
        this.fetchMovieUseCase = fetchMovieUseCase;
    }

    @Override
    protected NetplixMovie doRead() {
        if (this.contents.isEmpty() && hasNext && page <= MAX_PAGE) {
            readRow();
        }

        int size = contents.size();
        int index = size - 1;

        if (index < 0) {
            return null;
        }

        return contents.remove(contents.size() - 1);
    }

    @Override
    protected void doOpen() {
        setName(HttpPageItemReader.class.getName());
    }

    @Override
    protected void doClose() {

    }

    public void readRow() {
        System.out.println("========== TMDB API 페이지 조회 ==========");
        System.out.println("현재 페이지: " + page);
        
        try {
            MoviePageableResponse moviePageableResponse = fetchMovieUseCase.fetchFromClient(page);
            
            List<NetplixMovie> movies = moviePageableResponse.getMovies();
            contents.addAll(movies);
            
            // hasNext 업데이트
            hasNext = moviePageableResponse.getHasNext() != null && moviePageableResponse.getHasNext();
            
            System.out.println("조회된 영화 수: " + movies.size());
            System.out.println("다음 페이지 있음: " + hasNext);
            System.out.println("==========================================");
            
            page++;
        } catch (Exception e) {
            System.out.println("❌ API 호출 실패: " + e.getMessage());
            hasNext = false;
        }
    }
}
