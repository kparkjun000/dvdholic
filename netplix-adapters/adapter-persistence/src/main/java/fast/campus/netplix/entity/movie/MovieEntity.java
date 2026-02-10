package fast.campus.netplix.entity.movie;

import fast.campus.netplix.entity.audit.MutableBaseEntity;
import fast.campus.netplix.movie.NetplixMovie;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Entity
@Table(name = "movies")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class MovieEntity extends MutableBaseEntity {
    @Id
    @Column(name = "MOVIE_ID")
    private String movieId;

    @Column(name = "MOVIE_NAME")
    private String movieName;

    @Column(name = "IS_ADULT")
    private Boolean isAdult;

    @Column(name = "GENRE")
    private String genre;

    @Column(name = "OVERVIEW")
    private String overview;

    @Column(name = "RELEASED_AT")
    private String releasedAt;

    @Column(name = "POSTER_PATH")
    private String posterPath;

    @Column(name = "BACKDROP_PATH")
    private String backdropPath;

    @Column(name = "VOTE_AVERAGE")
    private Double voteAverage;

    @Column(name = "CAST", length = 500)
    private String cast;

    @Column(name = "DIRECTOR")
    private String director;

    @Column(name = "RUNTIME")
    private Integer runtime;

    @Column(name = "RELEASE_DATE")
    private String releaseDate;

    @Column(name = "CERTIFICATION")
    private String certification;

    @Column(name = "BUDGET")
    private Long budget;

    @Column(name = "REVENUE")
    private Long revenue;

    public NetplixMovie toDomain() {
        return NetplixMovie.builder()
                .movieName(this.movieName)
                .isAdult(this.isAdult)
                .genre(this.genre)
                .overview(this.overview)
                .releasedAt(this.releasedAt)
                .posterPath(this.posterPath)
                .backdropPath(this.backdropPath)
                .voteAverage(this.voteAverage)
                .cast(this.cast)
                .director(this.director)
                .runtime(this.runtime)
                .releaseDate(this.releaseDate)
                .certification(this.certification)
                .budget(this.budget)
                .revenue(this.revenue)
                .build();
    }

    public static MovieEntity toEntity(NetplixMovie netplixMovie) {
        return new MovieEntity(
                UUID.randomUUID().toString(),
                netplixMovie.getMovieName(),
                netplixMovie.getIsAdult(),
                netplixMovie.getGenre(),
                getSubstrOverview(netplixMovie.getOverview()),
                netplixMovie.getReleasedAt(),
                netplixMovie.getPosterPath(),
                netplixMovie.getBackdropPath(),
                netplixMovie.getVoteAverage(),
                netplixMovie.getCast(),
                netplixMovie.getDirector(),
                netplixMovie.getRuntime(),
                netplixMovie.getReleaseDate(),
                netplixMovie.getCertification(),
                netplixMovie.getBudget(),
                netplixMovie.getRevenue()
        );
    }

    private static String getSubstrOverview(String overview) {
        if (StringUtils.isBlank(overview)) {
            return "No description available.";
        }

        return overview.substring(0, Math.min(overview.length(), 200));
    }

}
