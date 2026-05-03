package com.secureauthlab.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "login_attempts")
public class LoginAttempt {

    @Id
    private String id;

    private String username;
    private String ipAddress;
    private String userAgent;
    private boolean success;

    @Indexed
    private LocalDateTime timestamp = LocalDateTime.now();

    /** "MANUAL" or "SIMULATION" */
    private String source = "MANUAL";

    public LoginAttempt(String username, String ipAddress, boolean success, String source) {
        this.username  = username;
        this.ipAddress = ipAddress;
        this.success   = success;
        this.source    = source;
    }

    // --- Getters and Setters for missing methods ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
