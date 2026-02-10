package fast.campus.netplix.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

@Getter
public class TmdbMovieDetails {
    private Integer id;
    private String title;
    private Integer runtime;
    private Long budget;
    private Long revenue;
    
    @JsonProperty("vote_average")
    private Double voteAverage;
    
    @JsonProperty("release_date")
    private String releaseDate;
}
