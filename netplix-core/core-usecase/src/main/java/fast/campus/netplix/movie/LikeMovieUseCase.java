package fast.campus.netplix.movie;

public interface LikeMovieUseCase {
    Boolean like(String userId, String movieId);
    Boolean unlike(String userId, String movieId);
    Long getLikeCount(String movieId);
    Long getUnlikeCount(String movieId);
}
