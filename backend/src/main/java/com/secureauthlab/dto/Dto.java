package com.secureauthlab.dto;

import lombok.Data;

public class Dto {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class LoginResponse {
        private boolean success;
        private String  message;
        private String  token;
        private String  username;
        private long    lockSeconds;

        public static LoginResponse ok(String token, String username) {
            LoginResponse r = new LoginResponse();
            r.success  = true;
            r.message  = "Login successful";
            r.token    = token;
            r.username = username;
            return r;
        }

        public static LoginResponse fail(String message) {
            LoginResponse r = new LoginResponse();
            r.success = false;
            r.message = message;
            return r;
        }

        public static LoginResponse locked(long seconds) {
            LoginResponse r = new LoginResponse();
            r.success     = false;
            r.message     = "Account locked. Try again in " + seconds + " seconds.";
            r.lockSeconds = seconds;
            return r;
        }
    }

    @Data
    public static class AttackRequest {
        private String  targetUsername;
        private String  mode;          // "dictionary" or "charset"
        private int     delayMs;
        private int     maxAttempts;
    }

    @Data
    public static class AttackStatus {
        private boolean  running;
        private int      attempts;
        private String   currentPassword;
        private boolean  cracked;
        private String   crackedPassword;
        private long     elapsedMs;
        private String   status;       // "running" | "cracked" | "blocked" | "stopped"
    }

    @Data
    public static class DashboardStats {
        private long totalAttempts;
        private long failedAttempts;
        private long successfulLogins;
        private long simulationAttempts;
        private long lockedAccounts;
        private java.util.List<HourBucket> attemptsOverTime;
        private java.util.List<String>     recentLogs;
    }

    @Data
    public static class HourBucket {
        private String time;
        private long   failed;
        private long   success;
    }
}
