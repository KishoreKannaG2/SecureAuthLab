package com.secureauthlab.service;

import com.secureauthlab.dto.Dto;
import com.secureauthlab.model.SecuritySettings;
import com.secureauthlab.repository.SecuritySettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class AttackSimulatorService {

    @Autowired private AuthService                authService;
    @Autowired private SecuritySettingsRepository settingsRepo;

    // ── State ──────────────────────────────────────────────────────────────
    private final AtomicBoolean   running         = new AtomicBoolean(false);
    private final AtomicBoolean   cracked         = new AtomicBoolean(false);
    private final AtomicInteger   attempts        = new AtomicInteger(0);
    private final AtomicReference<String> current = new AtomicReference<>("");
    private final AtomicReference<String> status  = new AtomicReference<>("idle");
    private final AtomicReference<String> crackedPw = new AtomicReference<>("");
    private long startTime = 0;

    private static final List<String> DICTIONARY = Arrays.asList(
        "123456","password","admin","admin123","letmein","qwerty","abc123",
        "password1","welcome","monkey","1234567","sunshine","master","hello",
        "test","root","pass","login","secure","secure1","secure12","secure123",
        "Admin@1234","Password@1","Test@123","iloveyou","dragon","baseball",
        "football","shadow","superman","batman","trustno1","access"
    );

    public void start(Dto.AttackRequest req) {
        if (running.get()) return;

        running.set(true);
        cracked.set(false);
        attempts.set(0);
        crackedPw.set("");
        status.set("running");
        startTime = System.currentTimeMillis();

        String target = req.getTargetUsername();
        int    delay  = Math.max(req.getDelayMs(), 50);

        Thread attackThread = new Thread(() -> {
            SecuritySettings cfg = settingsRepo.findById("global").orElse(new SecuritySettings());

            for (String pw : DICTIONARY) {
                if (!running.get()) { status.set("stopped"); return; }

                current.set(pw);
                attempts.incrementAndGet();

                boolean ok = authService.checkPassword(target, pw);
                authService.logSimulationAttempt(target, "127.0.0.1", ok);

                if (ok) {
                    cracked.set(true);
                    crackedPw.set(pw);
                    status.set("cracked");
                    running.set(false);
                    return;
                }

                // Simulate lockout blocking the attack
                if (cfg.isLockoutEnabled() && attempts.get() % cfg.getMaxAttempts() == 0) {
                    status.set("blocked");
                    running.set(false);
                    return;
                }

                try { Thread.sleep(delay); } catch (InterruptedException ignored) {}
            }

            status.set("exhausted");
            running.set(false);
        });

        attackThread.setDaemon(true);
        attackThread.start();
    }

    public void stop() {
        running.set(false);
        status.set("stopped");
    }

    public Dto.AttackStatus getStatus() {
        Dto.AttackStatus s = new Dto.AttackStatus();
        s.setRunning(running.get());
        s.setAttempts(attempts.get());
        s.setCurrentPassword(current.get());
        s.setCracked(cracked.get());
        s.setCrackedPassword(crackedPw.get());
        s.setElapsedMs(startTime > 0 ? System.currentTimeMillis() - startTime : 0);
        s.setStatus(status.get());
        return s;
    }
}
