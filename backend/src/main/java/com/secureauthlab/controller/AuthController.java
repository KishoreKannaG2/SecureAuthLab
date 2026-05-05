package com.secureauthlab.controller;

import com.secureauthlab.dto.Dto;
import com.secureauthlab.service.AuthService;
import com.secureauthlab.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private JwtUtil jwtUtil;

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

    @PostMapping("/change-password")
    public ResponseEntity<Dto.ChangePasswordResponse> changePassword(
            @RequestBody Dto.ChangePasswordRequest req,
            HttpServletRequest httpReq) {
        // Extract username from JWT token
        String token = extractTokenFromRequest(httpReq);
        String username = jwtUtil.extractUsername(token);
        
        Dto.ChangePasswordResponse res = authService.changePassword(
            username,
            req.getOldPassword(),
            req.getNewPassword(),
            req.getConfirmPassword()
        );
        
        int status = res.isSuccess() ? 200 : 400;
        return ResponseEntity.status(status).body(res);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
