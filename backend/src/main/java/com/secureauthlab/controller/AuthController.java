package com.secureauthlab.controller;

import com.secureauthlab.dto.Dto;
import com.secureauthlab.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Dto.LoginResponse> login(
            @RequestBody Dto.LoginRequest req,
            HttpServletRequest httpReq) {
        String ip = httpReq.getRemoteAddr();
        Dto.LoginResponse res = authService.login(req.getUsername(), req.getPassword(), ip);
        int status = res.isSuccess() ? 200 : (res.getLockSeconds() > 0 ? 423 : 401);
        return ResponseEntity.status(status).body(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out."));
    }

    @GetMapping("/sample-movies")
    public ResponseEntity<java.util.List<Dto.MovieDTO>> getSampleMovies() {
        java.util.List<Dto.MovieDTO> movies = authService.getSampleMflixMovies();
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/sample-movies/search")
    public ResponseEntity<java.util.List<Dto.MovieDTO>> searchSampleMovies(
            @RequestParam String title) {
        java.util.List<Dto.MovieDTO> movies = authService.searchSampleMflixMovies(title);
        return ResponseEntity.ok(movies);
    }
}
