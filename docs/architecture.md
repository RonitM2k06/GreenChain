# Green Chain: System Architecture

Green Chain is built as a highly decoupled, service-oriented decision intelligence platform. It consists of a React/Next.js frontend and a FastAPI backend designed to compute complex logistics optimizations in real-time.

## 1. System Components

### 1.1 Frontend (Next.js 16)
The UI is heavily geared toward executive personas, leveraging Tailwind CSS for rapid styling and Recharts for dynamic visual intelligence.
- **Routing:** App Router paradigm (`src/app/`).
- **State:** React Hooks (useState, useEffect) pulling directly from the FastAPI layer.

### 1.2 Backend (FastAPI & Python 3.12)
The backend is organized into standard service layers:
- `routers/`: Exposes HTTP API endpoints (e.g., `/api/v1/optimization`).
- `services/`: Contains the core mathematical and business logic.
- `data/`: Interfaces with raw CSV logs and synthetic data generators.

## 2. Core Analytics Pipeline

The true value of Green Chain is its linear analytical progression:

1. **Integrations Layer (`services/data_validator.py`)**
   - Ingests raw ERP tables (Suppliers, Shipments) and OCEL/CSV Event Logs.
   - Calculates a quantitative Data Quality score.
   
2. **Process Mining Engine (`services/process_mining.py`)**
   - Ingests the event logs using `PM4Py`.
   - Discovers the *actual* executed topology of the supply chain rather than relying on theoretical master data.
   
3. **Digital Twin Simulator (`services/digital_twin.py`)**
   - Takes the discovered topology and allows users to intentionally "break" nodes (e.g., Factory Fires, Port Strikes).
   - Uses Monte Carlo cascade logic to predict the ripple effects of the disruption.

4. **Multi-Objective Optimizer (`services/pareto_optimizer.py`)**
   - Reacts to the Digital Twin's broken state.
   - Generates thousands of potential recovery combinations.
   - Uses a non-dominated sorting algorithm to plot the Pareto Efficiency Frontier balancing **Cost, Carbon, Delay, and Risk**.

5. **Decision Traceability (`services/decision_trace.py`)**
   - Interprets the Pareto front for human executives.
   - Explains *why* certain strategies were rejected.
   - Generates Counterfactuals (e.g., "If you didn't choose this, you would have emitted X kg more carbon").

6. **Governance Ledger (`services/governance.py`)**
   - Cryptographically hashes approved strategies and logs them to an immutable SQLite ledger (`simulations.db`) for corporate ESG audits.

## 3. Continuous Intelligence
The `services/alert_engine.py` operates as a proactive daemon. It scans the Process Mining outputs and supplier risk metrics to auto-generate alerts before physical disruptions occur, preventing total supply chain failure.
