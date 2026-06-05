from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import dashboard, suppliers, simulator, process_mining, network, digital_twin, optimization, integrations, audit, governance, alerts
from api import health
import os
from research.experiment_runner import run_research_experiment

app = FastAPI(title="Green Supply Chain API", version="1.0.0")

@app.on_event("startup")
def startup_event():
    # Auto-generate research data if missing so the dashboard is never empty
    data_path = os.path.join(os.path.dirname(__file__), "data", "research", "research_results.json")
    if not os.path.exists(data_path):
        print("Auto-generating 100 Demo Research Simulations to populate dashboard...")
        run_research_experiment(100, 42)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(suppliers.router, prefix="/api/v1/suppliers", tags=["Suppliers"])
app.include_router(simulator.router, prefix="/api/v1/simulator", tags=["Simulator"])
app.include_router(process_mining.router, prefix="/api/v1/process-mining", tags=["Process Mining"])
app.include_router(network.router, prefix="/api/v1/network", tags=["Network"])
app.include_router(digital_twin.router, prefix="/api/v1/digital-twin", tags=["digital-twin"])
app.include_router(optimization.router, prefix="/api/v1/optimization", tags=["Optimization"])
app.include_router(integrations.router, prefix="/api/v1/integrations", tags=["Integrations"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(governance.router, prefix="/api/v1/governance", tags=["Governance"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])

@app.get("/")
def root():
    return {"message": "Green Supply Chain Resilience Intelligence Platform API is running"}
