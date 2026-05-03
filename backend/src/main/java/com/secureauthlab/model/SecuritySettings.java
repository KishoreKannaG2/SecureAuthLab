package com.secureauthlab.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "security_config")
public class SecuritySettings {
    // --- Getters and Setters for missing methods ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public boolean isLockoutEnabled() { return lockoutEnabled; }
    public void setLockoutEnabled(boolean lockoutEnabled) { this.lockoutEnabled = lockoutEnabled; }

    public int getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }

    public int getLockoutSeconds() { return lockoutSeconds; }
    public void setLockoutSeconds(int lockoutSeconds) { this.lockoutSeconds = lockoutSeconds; }

    public boolean isRateLimitEnabled() { return rateLimitEnabled; }
    public void setRateLimitEnabled(boolean rateLimitEnabled) { this.rateLimitEnabled = rateLimitEnabled; }

    public int getDelayMs() { return delayMs; }
    public void setDelayMs(int delayMs) { this.delayMs = delayMs; }

    @Id
    private String id = "global";

    private boolean lockoutEnabled   = true;
    private int     maxAttempts      = 5;
    private int     lockoutSeconds   = 60;
    private boolean rateLimitEnabled = true;
    private int     delayMs          = 0;
}
