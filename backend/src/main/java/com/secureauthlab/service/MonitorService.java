package com.secureauthlab.service;

import com.secureauthlab.dto.Dto;
import com.secureauthlab.model.LoginAttempt;
import com.secureauthlab.repository.LoginAttemptRepository;
import com.secureauthlab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MonitorService {

    @Autowired private LoginAttemptRepository attemptRepo;
    @Autowired private UserRepository         userRepo;

    public Dto.DashboardStats getStats() {
        Dto.DashboardStats stats = new Dto.DashboardStats();
        stats.setTotalAttempts(attemptRepo.count());
        stats.setFailedAttempts(attemptRepo.countBySuccess(false));
        stats.setSuccessfulLogins(attemptRepo.countBySuccess(true));
        stats.setSimulationAttempts(attemptRepo.countBySource("SIMULATION"));
        stats.setLockedAccounts(userRepo.findAll().stream()
            .filter(u -> u.getLockUntil() != null && LocalDateTime.now().isBefore(u.getLockUntil()))
            .count());

        // Attempts over last 12 hours, bucketed by hour
        LocalDateTime since = LocalDateTime.now().minusHours(12);
        List<LoginAttempt> recent = attemptRepo.findByTimestampAfterOrderByTimestampDesc(since);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:00");
        Map<String, long[]> buckets = new LinkedHashMap<>();
        for (int i = 11; i >= 0; i--) {
            String key = LocalDateTime.now().minusHours(i).format(fmt);
            buckets.put(key, new long[]{0, 0}); // [failed, success]
        }
        for (LoginAttempt a : recent) {
            String key = a.getTimestamp().format(fmt);
            if (buckets.containsKey(key)) {
                buckets.get(key)[a.isSuccess() ? 1 : 0]++;
            }
        }

        List<Dto.HourBucket> chart = buckets.entrySet().stream().map(e -> {
            Dto.HourBucket b = new Dto.HourBucket();
            b.setTime(e.getKey());
            b.setFailed(e.getValue()[0]);
            b.setSuccess(e.getValue()[1]);
            return b;
        }).collect(Collectors.toList());
        stats.setAttemptsOverTime(chart);

        // Recent log lines
        List<String> logs = attemptRepo.findTop100ByOrderByTimestampDesc().stream()
            .limit(20)
            .map(a -> String.format("[%s] %s login for \"%s\" from %s",
                a.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                a.isSuccess() ? "SUCCESS" : "FAILED",
                a.getUsername(),
                a.getIpAddress()))
            .collect(Collectors.toList());
        stats.setRecentLogs(logs);

        return stats;
    }

    public List<Map<String, Object>> getAttempts() {
        return attemptRepo.findTop100ByOrderByTimestampDesc().stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",        a.getId());
            m.put("username",  a.getUsername());
            m.put("ip",        a.getIpAddress());
            m.put("success",   a.isSuccess());
            m.put("source",    a.getSource());
            m.put("timestamp", a.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            return m;
        }).collect(Collectors.toList());
    }
}
