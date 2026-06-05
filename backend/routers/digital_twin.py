from fastapi import APIRouter
from pydantic import BaseModel
from services.digital_twin import run_digital_twin_simulation
from services.scenario_generator import run_batch_simulation

router = APIRouter()

class WhatIfRequest(BaseModel):
    supplier_id: str
    disruption_type: str
    severity: float

@router.post("/simulate")
def simulate_what_if(req: WhatIfRequest):
    try:
        result = run_digital_twin_simulation(req.supplier_id, req.disruption_type, req.severity)
        return result
    except Exception as e:
        return {"error": str(e)}

@router.get("/benchmark")
def benchmark_recovery_strategies(count: int = 100):
    try:
        result = run_batch_simulation(count)
        return result
    except Exception as e:
        return {"error": str(e)}
