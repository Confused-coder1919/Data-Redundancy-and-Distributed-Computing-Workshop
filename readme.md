# 🧠 Data Redundancy and Distributed Computing Workshop

This project implements two major sections:

1. **Part A:** Decentralized and Distributed Machine Learning using predictive APIs
2. **Part B:** Redundant E-Commerce API with DNS Load Balancing, Synchronous Mirroring, and Asynchronous Replication

---

## 🚀 Getting Started

### 🔧 Prerequisites
- Python 3.10+ with Flask
- Node.js (v18+)

---

## 📁 Project Structure

```
DataRedundancy-Workshop/
├── model_A/                     # Model A Flask API
├── model_B/                     # Model B Flask API
├── model_C/                     # Model C Flask API
├── meta_model/                  # Aggregator with weighted consensus & slashing
├── workshop-ecommerce/
│   ├── server_A/                # Main e-commerce server
│   ├── server_B/                # Redundant backup server
│   ├── dns_registry/            # Express DNS load balancer
│   ├── Synchronous_Mirroring/   # Real-time mirrored write
│   └── Asynchronous-Replication/ # Write primary, manual sync to mirror
```

---

## 🧠 Part A – Decentralized Predictive APIs

Each model exposes a REST API to predict Iris flower types.

### ➕ Model APIs
- `GET /predict?sl=5.1&sw=3.5&pl=1.4&pw=0.2`
- Runs on ports 5001–5003

### 🔗 Meta Model API
- `GET /predict?...` (aggregates A, B, C)
- Implements weighted average + stake-based slashing
- Runs on port 6001

---

## 🛒 Part B – Redundant E-Commerce System

### 🧾 Core Features
- `/products`, `/orders`, `/cart`
- Stateless, JSON-based API
- Two redundant servers: `server_A` (3001) and `server_B` (3002)

### 🌐 DNS Load Balancer
- Express server (port 8000)
- `GET /getServer` returns alternately 3001 or 3002

### 💾 Synchronous Mirroring
- Writes to both `db_primary.json` and `db_mirror.json`
- Server runs on port 3010

### 🔁 Asynchronous Replication
- Writes only to `db_primary.json`
- Replication triggered manually with `POST /sync`
- Server runs on port 3020

---

## 🧪 Sample CURL Commands
```bash
curl http://localhost:3001/products
curl -X POST http://localhost:3020/products -H "Content-Type: application/json" -d '{"name":"Tablet","price":299.99,...}'
curl -X POST http://localhost:3020/sync
```

> See [curl_tests.txt](./curl_tests.txt) for the full list

---

## 🧾 Report Template
- Use the included [report_template.md](./report_template.md) to complete your workshop write-up
- Contains checklists, screenshot placeholders, and question breakdowns (Q1–Q8)

---

## 👤 Author
**Syed Mohammad Shah Mostafa**  
M1 Cybersecurity & Cloud – ESILV – March 2025

---

## 📄 License
This project is for educational use only under the ESILV Workshop Program

