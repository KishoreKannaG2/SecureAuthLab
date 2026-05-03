package com.secureauthlab.repository;

import com.secureauthlab.model.LoginAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface LoginAttemptRepository extends MongoRepository<LoginAttempt, String> {
    List<LoginAttempt> findTop100ByOrderByTimestampDesc();
    long countBySuccess(boolean success);
    long countBySource(String source);
    long countByTimestampAfter(LocalDateTime since);
    List<LoginAttempt> findByTimestampAfterOrderByTimestampDesc(LocalDateTime since);
}
