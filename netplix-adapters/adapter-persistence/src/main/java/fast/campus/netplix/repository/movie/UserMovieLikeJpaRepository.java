package fast.campus.netplix.repository.movie;

import fast.campus.netplix.entity.movie.UserMovieLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserMovieLikeJpaRepository extends JpaRepository<UserMovieLikeEntity, String> {
    Optional<UserMovieLikeEntity> findByUserIdAndMovieId(String userId, String movieId);
    
    @Query("SELECT COUNT(u) FROM UserMovieLikeEntity u WHERE u.movieId = :movieId AND u.likeYn = true")
    Long countLikesByMovieId(@Param("movieId") String movieId);
    
    @Query("SELECT COUNT(u) FROM UserMovieLikeEntity u WHERE u.movieId = :movieId AND u.likeYn = false")
    Long countUnlikesByMovieId(@Param("movieId") String movieId);
}
