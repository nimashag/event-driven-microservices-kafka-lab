package com.microservices.order_service.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${lab.demo-mode:false}")
    private boolean demoMode;

    public OrderController(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @GetMapping
    public Map<String, Object> listOrders() {
        return Map.of(
                "orders", List.of(),
                "note",
                "This service does not persist orders. Use POST to publish an event to Kafka (or demo mode without Kafka).");
    }

    @PostMapping
    public String createOrder(@RequestBody String order) {
        if (demoMode) {
            return "Order accepted (LAB_DEMO_MODE=true — Kafka not used). Body: " + order;
        }
        kafkaTemplate.send("order-topic", order);
        return "Order Created & Event Published";
    }
}
