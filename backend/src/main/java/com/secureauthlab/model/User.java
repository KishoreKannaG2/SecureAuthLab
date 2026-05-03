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
}
