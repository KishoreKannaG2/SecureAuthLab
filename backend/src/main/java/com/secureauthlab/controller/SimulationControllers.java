package com.secureauthlab.controller;

import com.secureauthlab.dto.Dto;
import com.secureauthlab.model.SecuritySettings;
import com.secureauthlab.repository.SecuritySettingsRepository;
import com.secureauthlab.service.AttackSimulatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/attack")
class AttackController {

    @Autowired private AttackSimulatorService simulator;

    @PostMapping("/start")
    public Map<String, String> start(@RequestBody Dto.AttackRequest req) {
        simulator.start(req);
        return Map.of("message", "Simulation started.");
    }

    @PostMapping("/stop")
    public Map<String, String> stop() {
        simulator.stop();
        return Map.of("message", "Simulation stopped.");
    }

    @GetMapping("/status")
    public Dto.AttackStatus status() {
        return simulator.getStatus();
    }
}

@RestController
@RequestMapping("/api/security")
class SecurityController {

    @Autowired private SecuritySettingsRepository settingsRepo;

    @GetMapping("/config")
    public SecuritySettings getConfig() {
        return settingsRepo.findById("global").orElse(new SecuritySettings());
    }

    @PutMapping("/config")
    public SecuritySettings updateConfig(@RequestBody SecuritySettings updated) {
        updated.setId("global");
        return settingsRepo.save(updated);
    }
}
