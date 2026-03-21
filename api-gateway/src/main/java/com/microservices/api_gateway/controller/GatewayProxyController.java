package com.microservices.api_gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class GatewayProxyController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${order.service.base-url:http://localhost:8081}")
    private String orderServiceBaseUrl;

    private String orderServiceOrdersUrl() {
        String base = orderServiceBaseUrl.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/orders";
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"ok\"}");
    }

    @PostMapping("/orders")
    public ResponseEntity<String> createOrder(@RequestBody String order) {
        return restTemplate.postForEntity(orderServiceOrdersUrl(), order, String.class);
    }

    @GetMapping("/orders")
    public ResponseEntity<String> getOrders() {
        return restTemplate.getForEntity(orderServiceOrdersUrl(), String.class);
    }
}
