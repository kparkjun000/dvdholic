package fast.campus.netplix.controller.movie;

import fast.campus.netplix.authentication.token.JwtTokenProvider;
import fast.campus.netplix.controller.NetplixApiResponse;
import fast.campus.netplix.movie.LikeMovieUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/movie")
@RequiredArgsConstructor
public class UserMovieController {

    private final JwtTokenProvider jwtTokenProvider;
    private final LikeMovieUseCase likeMovieUseCase;

    @PostMapping("/{movieId}/like")
    @PreAuthorize("hasAnyRole('ROLE_FREE', 'ROLE_BRONZE', 'ROLE_SILVER', 'ROLE_GOLD')")
    public NetplixApiResponse<Boolean> likeMovie(@PathVariable String movieId) {
        return NetplixApiResponse.ok(likeMovieUseCase.like(jwtTokenProvider.getUserId(), movieId));
    }

    @PostMapping("/{movieId}/unlike")
    @PreAuthorize("hasAnyRole('ROLE_FREE', 'ROLE_BRONZE', 'ROLE_SILVER', 'ROLE_GOLD')")
    public NetplixApiResponse<Boolean> unlikeMovie(@PathVariable String movieId) {
        return NetplixApiResponse.ok(likeMovieUseCase.unlike(jwtTokenProvider.getUserId(), movieId));
    }
    
    @GetMapping("/{movieId}/like-count")
    public NetplixApiResponse<Long> getLikeCount(@PathVariable String movieId) {
        return NetplixApiResponse.ok(likeMovieUseCase.getLikeCount(movieId));
    }
    
    @GetMapping("/{movieId}/unlike-count")
    public NetplixApiResponse<Long> getUnlikeCount(@PathVariable String movieId) {
        return NetplixApiResponse.ok(likeMovieUseCase.getUnlikeCount(movieId));
    }
}
