package com.secureauthlab.config;

import com.secureauthlab.model.SecuritySettings;
import com.secureauthlab.model.User;
import com.secureauthlab.repository.SecuritySettingsRepository;
import com.secureauthlab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository             userRepo;
    @Autowired private SecuritySettingsRepository settingsRepo;
    @Autowired private PasswordEncoder            encoder;

    @Value("${admin.username}") private String adminUsername;
    @Value("${admin.password}") private String adminPassword;

    @Override
    public void run(String... args) {
        // Create admin if not exists
        if (!userRepo.existsByUsername(adminUsername)) {
            User admin = new User(
                adminUsername,
                "admin@secureauthlab.local",
                encoder.encode(adminPassword)   // BCrypt hash
            );
            admin.setRole("ADMIN");
            userRepo.save(admin);
            System.out.println("[SecureAuth Lab] Admin user created: " + adminUsername);
        }

        // Create default security settings if not exists
        if (!settingsRepo.existsById("global")) {
            settingsRepo.save(new SecuritySettings());
            System.out.println("[SecureAuth Lab] Default security settings created.");
        }
    }
}
