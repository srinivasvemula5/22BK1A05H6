package com.example.demo.service;

import com.example.demo.model.UrlMapping;
import com.example.demo.repository.UrlMappingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UrlShortenerService {

    private final UrlMappingRepository repository;

    public UrlShortenerService(UrlMappingRepository repository) {
        this.repository = repository;
    }

    public UrlMapping createShortUrl(String originalUrl, Integer validityMinutes, String preferredCode) {
        String shortcode;

        if (preferredCode != null && !preferredCode.trim().isEmpty()) {
            shortcode = preferredCode.trim();
            if (repository.findByShortcode(shortcode).isPresent()) {
                throw new IllegalArgumentException("Shortcode already exists: " + shortcode);
            }
        } else {
            do {
                shortcode = UUID.randomUUID().toString().substring(0, 8);
            } while (repository.findByShortcode(shortcode).isPresent());
        }

        UrlMapping mapping = new UrlMapping();
        mapping.setOriginalUrl(originalUrl);
        mapping.setShortcode(shortcode);
        mapping.setCreatedAt(LocalDateTime.now());

        if (validityMinutes != null && validityMinutes > 0) {
            mapping.setValidity(validityMinutes);
            mapping.setExpiresAt(LocalDateTime.now().plusMinutes(validityMinutes));
        } else {
            mapping.setExpiresAt(null);
        }

        return repository.save(mapping);
    }

    public Optional<UrlMapping> getByShortcode(String shortcode) {
        return repository.findByShortcode(shortcode);
    }
}
