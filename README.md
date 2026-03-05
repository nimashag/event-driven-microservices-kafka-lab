# Event-Driven Microservices with Kafka (KRaft Mode)

A complete implementation of event-driven microservices architecture using Spring Boot and Apache Kafka in KRaft mode (without ZooKeeper).

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project demonstrates a microservices architecture where services communicate asynchronously through Apache Kafka. When an order is placed, the Order Service publishes an event to Kafka, which is then consumed by both Inventory and Billing services.

## 🏗️ Architecture

```
Client (Postman/Browser)
         ↓
API Gateway (Port 8080)
         ↓
Order Service (8081) → Publishes Event (OrderCreated)
         ↓
Kafka (9092) - KRaft Mode
         ↓
    ┌────┴────┐
    ↓         ↓
Inventory    Billing
Service      Service
(8082)       (8083)
```

### System Flow

1. Client sends POST request to `/orders` via API Gateway
2. API Gateway routes the request to Order Service
3. Order Service saves the order and publishes `OrderCreated` event to Kafka topic `order-topic`
4. Inventory Service consumes the event and updates stock
5. Billing Service consumes the event and generates invoice

## 🛠️ Technologies

- **Java 17**
- **Spring Boot 4.0.3**
- **Spring Cloud Gateway (MVC)**
- **Spring Kafka**
- **Apache Kafka 7.6.0 (KRaft Mode)**
- **Docker & Docker Compose**
- **Maven**

## ✅ Prerequisites

Before running this application, ensure you have:

- **Java 17** or higher installed
- **Maven 3.6+** installed
- **Docker Desktop** installed and running
- **Postman** or **curl** for testing APIs
- Ports **8080-8083** and **9092** available

## 📁 Project Structure

```
event-driven-microservices-kafka-lab/
├── api-gateway/               # API Gateway Service
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/microservices/api_gateway/
│   │       │       ├── ApiGatewayApplication.java
│   │       │       └── controller/
│   │       │           └── GatewayProxyController.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
│
├── order-service/             # Order Service (Producer)
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/microservices/order_service/
│   │       │       ├── OrderServiceApplication.java
│   │       │       └── controller/
│   │       │           └── OrderController.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
│
├── inventory-service/         # Inventory Service (Consumer)
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/microservices/inventory_service/
│   │       │       ├── InventoryServiceApplication.java
│   │       │       └── consumer/
│   │       │           └── InventoryConsumer.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
│
├── billing-service/           # Billing Service (Consumer)
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/microservices/billing_service/
│   │       │       ├── BillingServiceApplication.java
│   │       │       └── consumer/
│   │       │           └── BillingConsumer.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
│
├── docker-compose.yml         # Kafka configuration
└── README.md
```

## 🚀 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/nimashag/event-driven-microservices-kafka-lab.git
cd event-driven-microservices-kafka-lab
```

### Step 2: Build All Services

Build each microservice using Maven:

```bash
# Build API Gateway
cd api-gateway
mvn clean install
cd ..

# Build Order Service
cd order-service
mvn clean install
cd ..

# Build Inventory Service
cd inventory-service
mvn clean install
cd ..

# Build Billing Service
cd billing-service
mvn clean install
cd ..
```

### Step 3: Start Docker Desktop

Ensure Docker Desktop is running on your system.

### Step 4: Start Kafka

Start Kafka in KRaft mode using Docker Compose:

```bash
docker-compose up -d
```

Verify Kafka is running:

```bash
docker ps
docker logs kafka
```

## 🏃 Running the Application

Open **4 separate terminal windows** and run each service:

### Terminal 1: API Gateway

```bash
cd api-gateway
mvn spring-boot:run
```

Wait for: `Started ApiGatewayApplication` on port **8080**

### Terminal 2: Order Service

```bash
cd order-service
mvn spring-boot:run
```

Wait for: `Started OrderServiceApplication` on port **8081**

### Terminal 3: Inventory Service

```bash
cd inventory-service
mvn spring-boot:run
```

Wait for: `Started InventoryServiceApplication` on port **8082**

### Terminal 4: Billing Service

```bash
cd billing-service
mvn spring-boot:run
```

Wait for: `Started BillingServiceApplication` on port **8083**

### Verify All Services

Check that all services are running:

```bash
# Windows
netstat -ano | findstr "808"

# Linux/Mac
lsof -i :8080-8083
```

You should see ports **8080, 8081, 8082, 8083** in LISTENING state.

## 🧪 Testing

### Using Postman

**Create Order Request:**

```
POST http://localhost:8080/orders
Content-Type: application/json

Body:
{
  "orderId": "ORD-1001",
  "item": "Laptop",
  "quantity": 1
}
```

**Expected Response:**

```
Order Created & Event Published
```

### Using curl

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORD-1001","item":"Laptop","quantity":1}'
```

### Verify Kafka Messages

Check messages in the Kafka topic:

```bash
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order-topic \
  --from-beginning \
  --max-messages 10
```

### Expected Console Output

**Order Service Console:**

```
Order received: {"orderId":"ORD-1001","item":"Laptop","quantity":1}
Publishing to Kafka topic: order-topic
```

**Inventory Service Console:**

```
Inventory Service received order: {"orderId":"ORD-1001","item":"Laptop","quantity":1}
Updating stock...
```

**Billing Service Console:**

```
Billing Service received order: {"orderId":"ORD-1001","item":"Laptop","quantity":1}
Generating invoice...
```

## 📚 API Documentation

### API Gateway

| Method | Endpoint  | Description        |
| ------ | --------- | ------------------ |
| POST   | `/orders` | Create a new order |
| GET    | `/orders` | Get all orders     |

### Order Service (Direct Access)

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| POST   | `http://localhost:8081/orders` | Create order directly |

## 🔧 Troubleshooting

### Issue: Docker containers not starting

**Solution:**

```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Restart
docker-compose up -d
```

### Issue: Port already in use

**Windows:**

```bash
# Find process using port
netstat -ano | findstr "8080"

# Kill process
taskkill //F //PID <PID_NUMBER>
```

**Linux/Mac:**

```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9
```

### Issue: Kafka connection refused

**Check Kafka status:**

```bash
docker ps
docker logs kafka
```

**Verify Kafka is accessible:**

```bash
docker exec kafka kafka-broker-api-versions \
  --bootstrap-server localhost:9092
```

### Issue: Services not consuming messages

**Verify consumer groups:**

```bash
docker exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --list
```

**Check consumer lag:**

```bash
docker exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe \
  --group inventory-group
```

### Issue: Gateway routing not working

The API Gateway uses a proxy controller approach. If you encounter routing issues:

1. Verify Order Service is running on port 8081
2. Check Gateway logs for connection errors
3. Test Order Service directly: `curl http://localhost:8081/orders`

## 📊 Configuration Details

### Kafka Configuration (docker-compose.yml)

- **Mode**: KRaft (Kafka Raft - no ZooKeeper)
- **Port**: 9092
- **Replication Factor**: 1 (suitable for development)
- **Topic**: `order-topic` (auto-created)

### Service Ports

- API Gateway: **8080**
- Order Service: **8081**
- Inventory Service: **8082**
- Billing Service: **8083**
- Kafka: **9092**

## 🎓 Learning Resources

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Spring for Apache Kafka](https://spring.io/projects/spring-kafka)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [KRaft Mode in Kafka](https://kafka.apache.org/documentation/#kraft)


## 📄 License

This project is created for educational purposes.


