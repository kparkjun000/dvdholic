package fast.campus.netplix.movie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class NetplixMovie {
    private final String movieName;
    private final Boolean isAdult;
    private final String genre;
    private final String overview;
    private final String releasedAt;
    private final String posterPath;
    private final String backdropPath;
    private final Double voteAverage;      // 평점
    private final String cast;             // 배우 정보 (쉼표로 구분)
    private final String director;         // 감독
    private final Integer runtime;         // 상영 시간 (분)
    private final String releaseDate;      // 개봉일
    private final String certification;    // 관람 등급
    private final Long budget;             // 예산
    private final Long revenue;            // 수익
}
