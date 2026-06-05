# Green Chain: Carbon-Aware Supply Chain Intelligence

Green Chain is an enterprise-grade Decision Intelligence Platform built to solve the mathematical trade-offs between supply chain resilience and environmental sustainability. It proactively monitors logistics networks, discovers actual topologies using Process Mining, simulates disruptions via Digital Twins, and recommends recovery strategies using Multi-Objective Pareto Optimization.

## Features
- **Process Mining (PM4Py)**: Dynamically discovers supply chain routes from raw event logs.
- **Continuous Intelligence**: Automatically monitors supplier risk scores and carbon hotspots.
- **Digital Twin Simulation**: Run Monte Carlo simulations for hypothetical disruptions (e.g., Port Strikes, Factory Fires).
- **Pareto Optimization**: Balances Cost, Delay, Carbon, and Risk on a mathematical efficiency frontier.
- **Explainable AI (XAI)**: Generates explicit counterfactuals ("Carbon Saved") to justify AI recommendations to executives.
- **Enterprise Governance**: Secure cryptographic sign-offs for strategy selection.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 18, Tailwind CSS, Recharts
- **Backend**: FastAPI, Python 3.12, Uvicorn, Pandas, PM4Py
- **Architecture**: Service-Oriented (Decoupled API)

## Getting Started

### 1. Backend Setup
Navigate to the `backend` directory and start the FastAPI server:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
Navigate to the `frontend` directory and start the Next.js server:
```bash
cd frontend
npm install
npm run dev
```

The platform will be available at `http://localhost:3000`.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
