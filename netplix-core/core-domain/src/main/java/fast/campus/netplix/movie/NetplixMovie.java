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
}
