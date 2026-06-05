# Green Chain API Reference

The FastAPI backend exposes several RESTful endpoints to power the analytics dashboard. Base URL locally is `http://localhost:8000/api/v1`.

## 1. Process Mining
`GET /process-mining/summary`
- **Description:** Returns the discovered supply chain graph statistics using PM4Py.
- **Response:** Nodes, edges, total events, and average process carbon intensity.

`GET /process-mining/topology`
- **Description:** Returns the Directly-Follows Graph (DFG) for visual rendering in the UI.

## 2. Digital Twin
`POST /digital-twin/simulate`
- **Description:** Triggers a theoretical disruption at a specific node.
- **Payload:** `{"supplier_id": "SUP-001", "disruption_type": "PORT_STRIKE", "severity": 0.8}`
- **Response:** Ripple effect impact and generated alternative recovery strategies.

`GET /digital-twin/benchmark?count=100`
- **Description:** Runs batch Monte Carlo simulations across randomized synthetic disruptions to test structural resilience.

## 3. Pareto Optimization
`POST /optimization/pareto`
- **Description:** Solves the Multi-Objective optimization problem to find non-dominated recovery routes.
- **Payload:** `{"supplier_id": "SUP-001", "disruption_type": "FACTORY_FIRE", "severity": 0.8}`
- **Response:** Returns `pareto_front` (optimal) and `dominated_strategies` (sub-optimal) arrays.

## 4. Audit & Governance
`GET /audit/trace/{id}`
- **Description:** Fetches the full decision lineage, including policy violations, confidence scores, and counterfactual analysis.

`POST /governance/{trace_id}/approve`
- **Description:** Cryptographically signs and logs a selected strategy to the immutable ledger.
- **Payload:** `{"approver_role": "SUPPLY_CHAIN_VP", "comments": "Approved to avoid port strike delay."}`

## 5. Alerts
`GET /alerts`
- **Description:** Returns the active Continuous Intelligence alerts (Supplier Risk, Carbon Hotspots).
