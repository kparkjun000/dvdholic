package fast.campus.netplix.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;
import java.util.Map;

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
    
    @JsonProperty("belongs_to_collection")
    private Map<String, Object> belongsToCollection;
    
    public String getCollectionName() {
        if (belongsToCollection != null && belongsToCollection.get("name") != null) {
            return (String) belongsToCollection.get("name");
        }
        return null;
    }
}
