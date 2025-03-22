# 📘 Final Report – Data Redundancy and Distributed Computing Workshop

## 👤 Student Info
- **Name:** Syed Mohammad Shah Mostafa  
- **Program:** ESILV – M1 Cybersecurity & Cloud  
- **Date:** March 2025

---

## 🧠 Part A – Decentralized Prediction Models

### Q1: Build Predictive APIs
Implemented 3 predictive Flask APIs:
- **Model A**: Random Forest Classifier (port 5001)
- **Model B**: Decision Tree Classifier (port 5002)
- **Model C**: K-Nearest Neighbors (port 5003)

Each API exposes:
```http
GET /predict?sl=5.1&sw=3.5&pl=1.4&pw=0.2
```
✅ Tested all endpoints using curl. Each returned consistent predictions.

### Q2: Meta Model & Consensus
- Implemented a consensus API at port 6001
- Aggregates predictions from A, B, and C and returns average mode
- Response example:
```json
{
  "consensus_prediction": 0,
  "individual_predictions": [0, 0, 0]
}
```
✅ Curl tested: successful aggregation of predictions.

### Q3: Weighted Consensus
- Weights are dynamically adjusted after each request.
- If a model deviates from consensus, its weight decreases.
- Initial weight: 1.00, adjusted using performance.
✅ Example weights after request:
```json
{"model_A": 1.05, "model_B": 1.05, "model_C": 1.05}
```

### Q4: Slashing + Proof-of-Stake
- Each model starts with 1000€ stake in `balances.json`
- If a model performs poorly or deviates, balance is reduced
- If it performs well, balance is rewarded
✅ Example `balances.json`:
```json
{
  "model_A": {"balance": 1005, "weight": 1.05},
  "model_B": {"balance": 1005, "weight": 1.05},
  "model_C": {"balance": 1005, "weight": 1.05}
}
```

---

## 🛒 Part B – Distributed E-Commerce API

### Q1–Q2: Hello World & DNS Routing
- Implemented `server_A` (3001) and `server_B` (3002)
- `dns_registry` on port 8000 returns alternating responses:
```json
{"code":200,"server":"localhost:3001"}
{"code":200,"server":"localhost:3002"}
```
✅ Works as round-robin load balancer.

### Q3–Q4: Product/Order/Cart APIs
All APIs are RESTful and respond in JSON.
- Products: GET, POST, PUT, DELETE
- Orders: POST order, GET by userId
- Cart: POST add item, GET cart, DELETE item
✅ Fully functional on both server_A and server_B.

### Q5: Simple Frontend
Skipped per instructions. APIs tested via curl.

### Q6: Simulate Server Failure
- Stopped `server_A`
- DNS returned `localhost:3002`, and user was unaffected
✅ Demonstrated DNS-based failover.

---

## 💾 Q7 – Synchronous Mirroring
- Server at port 3010
- Writes go to both `db_primary.json` and `db_mirror.json`
✅ Added product:
```json
{"name":"Smartwatch", ...}
```
✅ Verified both files were updated in real-time.

---

## 🔁 Q8 – Asynchronous Replication
- Server at port 3020
- Writes only to `db_primary.json`
- Mirror updated manually via:
```bash
curl -X POST http://localhost:3020/sync
```
✅ Verified before and after syncing:
- Mirror initially outdated
- After `/sync`, both DBs matched

---

## 🏁 Conclusion
This workshop was a hands-on dive into real-world distributed systems:
- Learned how to use Flask and Express for distributed microservices
- Understood redundancy via DNS and multi-server architecture
- Implemented real-time and manual data replication
- Simulated consensus mechanisms and slashing logic

**Challenges faced:** port conflicts, managing curl for testing

**Next steps if extended:** Use Docker Compose to deploy multi-container version of the system, or add UI for ecommerce.

---

## 📎 Appendix
**Curl Commands Used:** see `curl_tests.txt`  
**Screenshots:** attached in final submission zip

✅ All features complete and tested.

