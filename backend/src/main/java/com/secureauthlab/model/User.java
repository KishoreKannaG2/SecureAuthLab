package com.secureauthlab.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String email;

    /** BCrypt-hashed password — never store plain text */
    private String passwordHash;

    private String role = "ADMIN";

    private int failedAttempts = 0;

    /** Null = not locked. Non-null = locked until this time. */
    private LocalDateTime lockUntil;

    private String lastLoginIp;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt = LocalDateTime.now();

    public User(String username, String email, String passwordHash) {
        this.username     = username;
        this.email        = email;
        this.passwordHash = passwordHash;
    }

    public boolean isLocked() {
        if (lockUntil == null) return false;
        if (LocalDateTime.now().isBefore(lockUntil)) return true;
        // Auto-clear expired lock
        this.lockUntil       = null;
        this.failedAttempts  = 0;
        return false;
    }

    public long secondsUntilUnlock() {
        if (lockUntil == null) return 0;
        return java.time.Duration.between(LocalDateTime.now(), lockUntil).getSeconds();
    }

    // --- Getters and Setters for missing methods ---
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }

    public LocalDateTime getLockUntil() { return lockUntil; }
    public void setLockUntil(LocalDateTime lockUntil) { this.lockUntil = lockUntil; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getLastLoginIp() { return lastLoginIp; }
    public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
