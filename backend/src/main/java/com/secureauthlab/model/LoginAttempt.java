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
}
