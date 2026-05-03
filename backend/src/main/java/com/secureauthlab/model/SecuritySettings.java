package com.secureauthlab.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "security_config")
public class SecuritySettings {

    @Id
    private String id = "global";

    private boolean lockoutEnabled   = true;
    private int     maxAttempts      = 5;
    private int     lockoutSeconds   = 60;
    private boolean rateLimitEnabled = true;
    private int     delayMs          = 0;
}
