package com.example.demo.controller;

import com.example.demo.model.UrlMapping;
import com.example.demo.service.UrlShortenerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UrlShortenerController {

    private final UrlShortenerService service;

    public UrlShortenerController(UrlShortenerService service) {
        this.service = service;
    }

    @PostMapping("/api/shorten")
    public ResponseEntity<Map<String, String>> shortenUrl(@RequestBody Map<String, String> payload) {
        String originalUrl = payload.get("originalUrl");
        Integer validity = null;
        try {
            if (payload.get("validity") != null) {
                validity = Integer.parseInt(payload.get("validity"));
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid validity value"));
        }

        String shortcode = payload.get("shortcode");

        try {
            UrlMapping mapping = service.createShortUrl(originalUrl, validity, shortcode);
            String shortUrl = "http://localhost:8080/" + mapping.getShortcode();
            return ResponseEntity.ok(Map.of("shortUrl", shortUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{shortcode}")
    public ResponseEntity<?> redirect(@PathVariable String shortcode) {
        return service.getByShortcode(shortcode)
                .filter(mapping -> mapping.getExpiresAt() == null || mapping.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(mapping -> ResponseEntity.status(302).location(URI.create(mapping.getOriginalUrl())).build())
                .orElse(ResponseEntity.notFound().build());
    }
}
