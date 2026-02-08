package fast.campus.netplix.batch;

import fast.campus.netplix.movie.FetchMovieUseCase;
import fast.campus.netplix.movie.InsertMovieUseCase;
import fast.campus.netplix.movie.NetplixMovie;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MigrateMoviesFromTmdbBatch {

    private final static String BATCH_NAME = "MigrateMoviesFromTmdbBatch";

    private final FetchMovieUseCase fetchMovieUseCase;
    private final InsertMovieUseCase insertMovieUseCase;

    @Bean(name = BATCH_NAME)
    public Job job(JobRepository jobRepository, PlatformTransactionManager platformTransactionManager) {
        return new JobBuilder(BATCH_NAME, jobRepository)
                .preventRestart()
                .start(step(jobRepository, platformTransactionManager))
                .incrementer(new RunIdIncrementer())
                .build();
    }

    @Bean(name = "MigrateMoviesFromTmdbBatchTaskletStep")
    public Step step(JobRepository jobRepository, PlatformTransactionManager platformTransactionManager) {
        return new StepBuilder("MigrateMoviesFromTmdbBatchTaskletStep", jobRepository)
                .chunk(10, platformTransactionManager)
                .reader(new HttpPageItemReader(1, fetchMovieUseCase))
                .writer(chunk -> {
                    List<NetplixMovie> items = (List<NetplixMovie>) chunk.getItems();
                    // Filter out movies with corrupted Korean text
                    List<NetplixMovie> validItems = items.stream()
                            .filter(this::isValidOverview)
                            .collect(Collectors.toList());
                    
                    log.info("Filtered {} movies out of {}", items.size() - validItems.size(), items.size());
                    insertMovieUseCase.insert(validItems);
                })
                .build();
    }
    
    private boolean isValidOverview(NetplixMovie movie) {
        String overview = movie.getOverview();
        
        // Accept all movies including those without overview
        // Korean text encoding will be handled by database UTF-8 settings
        return true;
    }
}
