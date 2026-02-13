package fast.campus.netplix.movie;

import java.util.Optional;

public interface LikeMoviePort {
    UserMovieLike save(UserMovieLike domain);

    Optional<UserMovieLike> findByUserIdAndMovieId(String userId, String movieId);
    
    Long countLikesByMovieId(String movieId);
    
    Long countUnlikesByMovieId(String movieId);
}
