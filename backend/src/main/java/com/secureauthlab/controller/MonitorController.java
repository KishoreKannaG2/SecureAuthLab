package com.secureauthlab.controller;

import com.secureauthlab.dto.Dto;
import com.secureauthlab.service.MonitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/monitor")
public class MonitorController {

    @Autowired private MonitorService monitorService;

    @GetMapping("/stats")
    public Dto.DashboardStats getStats() {
        return monitorService.getStats();
    }

    @GetMapping("/attempts")
    public List<Map<String, Object>> getAttempts() {
        return monitorService.getAttempts();
    }
}
