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
    private final String contentType;      // 컨텐츠 타입 ("dvd" 또는 "movie")
    private final String trailerUrl;       // 예고편 URL (YouTube)
    private final String ottProviders;     // OTT 제공 플랫폼 (쉼표로 구분)
    private final String collection;       // 시리즈/컬렉션 정보
    private final String recommendations;  // 추천 영화 (쉼표로 구분, 최대 5개)
    private final String topReview;        // 대표 리뷰 (가장 인기 있는 리뷰 하나)
}
