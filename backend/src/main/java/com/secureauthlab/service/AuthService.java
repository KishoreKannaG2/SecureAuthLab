package com.secureauthlab.service;

import com.secureauthlab.dto.Dto;
import com.secureauthlab.model.LoginAttempt;
import com.secureauthlab.model.SecuritySettings;
import com.secureauthlab.model.User;
import com.secureauthlab.repository.LoginAttemptRepository;
import com.secureauthlab.repository.SecuritySettingsRepository;
import com.secureauthlab.repository.UserRepository;
import com.secureauthlab.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    @Autowired private UserRepository             userRepo;
    @Autowired private LoginAttemptRepository     attemptRepo;
    @Autowired private SecuritySettingsRepository settingsRepo;
    @Autowired private PasswordEncoder            encoder;
    @Autowired private JwtUtil                    jwtUtil;
    @Autowired @Qualifier("sampleMflixTemplate") private MongoTemplate mongoTemplate;

    public Dto.LoginResponse login(String username, String password, String ip) {
        SecuritySettings cfg = getSettings();

        User user = userRepo.findByUsername(username).orElse(null);
        if (user == null) {
            log(username, ip, false, "MANUAL");
            return Dto.LoginResponse.fail("Invalid credentials.");
        }

        // ── Lockout check ──────────────────────────────────────────────────
        if (cfg.isLockoutEnabled() && user.isLocked()) {
            long secs = user.secondsUntilUnlock();
            log(username, ip, false, "MANUAL");
            return Dto.LoginResponse.locked(secs);
        }

        // ── Password check ─────────────────────────────────────────────────
        if (!encoder.matches(password, user.getPasswordHash())) {
            if (cfg.isLockoutEnabled()) {
                int attempts = user.getFailedAttempts() + 1;
                user.setFailedAttempts(attempts);

                if (attempts >= cfg.getMaxAttempts()) {
                    user.setLockUntil(LocalDateTime.now().plusSeconds(cfg.getLockoutSeconds()));
                    user.setFailedAttempts(0);
                    userRepo.save(user);
                    log(username, ip, false, "MANUAL");
                    return Dto.LoginResponse.locked(cfg.getLockoutSeconds());
                }
                userRepo.save(user);
                int left = cfg.getMaxAttempts() - attempts;
                log(username, ip, false, "MANUAL");
                return Dto.LoginResponse.fail(
                    "Invalid credentials. " + left + " attempt(s) left before lockout.");
            }
            log(username, ip, false, "MANUAL");
            return Dto.LoginResponse.fail("Invalid credentials.");
        }

        // ── Success ────────────────────────────────────────────────────────
        user.setFailedAttempts(0);
        user.setLockUntil(null);
        user.setLastLogin(LocalDateTime.now());
        user.setLastLoginIp(ip);
        userRepo.save(user);

        log(username, ip, true, "MANUAL");
        return Dto.LoginResponse.ok(jwtUtil.generate(username), username);
    }

    // Used by simulation service — no lockout applies during simulation
    public boolean checkPassword(String username, String password) {
        return userRepo.findByUsername(username)
            .map(u -> encoder.matches(password, u.getPasswordHash()))
            .orElse(false);
    }

    public void logSimulationAttempt(String username, String ip, boolean success) {
        log(username, ip, success, "SIMULATION");
    }

    private void log(String username, String ip, boolean success, String source) {
        LoginAttempt a = new LoginAttempt(username, ip, success, source);
        attemptRepo.save(a);
    }

    private SecuritySettings getSettings() {
        return settingsRepo.findById("global").orElse(new SecuritySettings());
    }

    public List<Dto.MovieDTO> getSampleMflixMovies() {
        Query query = new Query().limit(50);
        return mongoTemplate.find(query, Dto.MovieDTO.class, "movies");
    }

    public List<Dto.MovieDTO> searchSampleMflixMovies(String title) {
        Query query = new Query()
            .addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("title")
                .regex(title, "i"))
            .limit(50);
        return mongoTemplate.find(query, Dto.MovieDTO.class, "movies");
    }
}
