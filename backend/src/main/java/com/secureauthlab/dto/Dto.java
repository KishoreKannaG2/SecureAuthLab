package com.secureauthlab.dto;

import lombok.Data;

public class Dto {

    @Data
    public static class LoginRequest {
            // Explicit getters and setters for compatibility
            public String getUsername() { return username; }
            public void setUsername(String username) { this.username = username; }
            public String getPassword() { return password; }
            public void setPassword(String password) { this.password = password; }
        private String username;
        private String password;
    }

    @Data
    public static class LoginResponse {
            public boolean isSuccess() { return success; }
            public void setSuccess(boolean success) { this.success = success; }
            public String getMessage() { return message; }
            public void setMessage(String message) { this.message = message; }
            public String getToken() { return token; }
            public void setToken(String token) { this.token = token; }
            public String getUsername() { return username; }
            public void setUsername(String username) { this.username = username; }
            public long getLockSeconds() { return lockSeconds; }
            public void setLockSeconds(long lockSeconds) { this.lockSeconds = lockSeconds; }
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
            public String getTargetUsername() { return targetUsername; }
            public void setTargetUsername(String targetUsername) { this.targetUsername = targetUsername; }
            public String getMode() { return mode; }
            public void setMode(String mode) { this.mode = mode; }
            public int getDelayMs() { return delayMs; }
            public void setDelayMs(int delayMs) { this.delayMs = delayMs; }
            public int getMaxAttempts() { return maxAttempts; }
            public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }
        private String  targetUsername;
        private String  mode;          // "dictionary" or "charset"
        private int     delayMs;
        private int     maxAttempts;
    }

    @Data
    public static class AttackStatus {
            public boolean isRunning() { return running; }
            public void setRunning(boolean running) { this.running = running; }
            public int getAttempts() { return attempts; }
            public void setAttempts(int attempts) { this.attempts = attempts; }
            public String getCurrentPassword() { return currentPassword; }
            public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
            public boolean isCracked() { return cracked; }
            public void setCracked(boolean cracked) { this.cracked = cracked; }
            public String getCrackedPassword() { return crackedPassword; }
            public void setCrackedPassword(String crackedPassword) { this.crackedPassword = crackedPassword; }
            public long getElapsedMs() { return elapsedMs; }
            public void setElapsedMs(long elapsedMs) { this.elapsedMs = elapsedMs; }
            public String getStatus() { return status; }
            public void setStatus(String status) { this.status = status; }
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
            public long getTotalAttempts() { return totalAttempts; }
            public void setTotalAttempts(long totalAttempts) { this.totalAttempts = totalAttempts; }
            public long getFailedAttempts() { return failedAttempts; }
            public void setFailedAttempts(long failedAttempts) { this.failedAttempts = failedAttempts; }
            public long getSuccessfulLogins() { return successfulLogins; }
            public void setSuccessfulLogins(long successfulLogins) { this.successfulLogins = successfulLogins; }
            public long getSimulationAttempts() { return simulationAttempts; }
            public void setSimulationAttempts(long simulationAttempts) { this.simulationAttempts = simulationAttempts; }
            public long getLockedAccounts() { return lockedAccounts; }
            public void setLockedAccounts(long lockedAccounts) { this.lockedAccounts = lockedAccounts; }
            public java.util.List<HourBucket> getAttemptsOverTime() { return attemptsOverTime; }
            public void setAttemptsOverTime(java.util.List<HourBucket> attemptsOverTime) { this.attemptsOverTime = attemptsOverTime; }
            public java.util.List<String> getRecentLogs() { return recentLogs; }
            public void setRecentLogs(java.util.List<String> recentLogs) { this.recentLogs = recentLogs; }
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
            public String getTime() { return time; }
            public void setTime(String time) { this.time = time; }
            public long getFailed() { return failed; }
            public void setFailed(long failed) { this.failed = failed; }
            public long getSuccess() { return success; }
            public void setSuccess(long success) { this.success = success; }
        private String time;
        private long   failed;
        private long   success;
    }

    @Data
    public static class MovieDTO {
            public String getId() { return id; }
            public void setId(String id) { this.id = id; }
            public String getTitle() { return title; }
            public void setTitle(String title) { this.title = title; }
            public String getPlot() { return plot; }
            public void setPlot(String plot) { this.plot = plot; }
            public Integer getYear() { return year; }
            public void setYear(Integer year) { this.year = year; }
            public Double getImdbRating() { return imdbRating; }
            public void setImdbRating(Double imdbRating) { this.imdbRating = imdbRating; }
            public java.util.List<String> getGenres() { return genres; }
            public void setGenres(java.util.List<String> genres) { this.genres = genres; }
            public java.util.List<String> getCast() { return cast; }
            public void setCast(java.util.List<String> cast) { this.cast = cast; }
            public String getDirector() { return director; }
            public void setDirector(String director) { this.director = director; }
            public Integer getRuntime() { return runtime; }
            public void setRuntime(Integer runtime) { this.runtime = runtime; }
            public String getCountry() { return country; }
            public void setCountry(String country) { this.country = country; }
        private String id;
        private String title;
        private String plot;
        private Integer year;
        private Double imdbRating;
        private java.util.List<String> genres;
        private java.util.List<String> cast;
        private String director;
        private Integer runtime;
        private String country;
    }

    @Data
    public static class ChangePasswordRequest {
            public String getOldPassword() { return oldPassword; }
            public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
            public String getNewPassword() { return newPassword; }
            public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
            public String getConfirmPassword() { return confirmPassword; }
            public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
        private String oldPassword;
        private String newPassword;
        private String confirmPassword;
    }

    @Data
    public static class ChangePasswordResponse {
            public boolean isSuccess() { return success; }
            public void setSuccess(boolean success) { this.success = success; }
            public String getMessage() { return message; }
            public void setMessage(String message) { this.message = message; }
        private boolean success;
        private String message;

        public static ChangePasswordResponse success(String message) {
            ChangePasswordResponse res = new ChangePasswordResponse();
            res.success = true;
            res.message = message;
            return res;
        }

        public static ChangePasswordResponse error(String message) {
            ChangePasswordResponse res = new ChangePasswordResponse();
            res.success = false;
            res.message = message;
            return res;
        }
    }
}
