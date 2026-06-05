from fastapi import APIRouter
from pydantic import BaseModel
from services.recommendation_engine import generate_recovery_workflow
from services.storage import get_simulation
import uuid
import json

router = APIRouter()

class SimulationRequest(BaseModel):
    supplier_id: str
    type: str
    severity: float

@router.post("/simulate")
def simulate_disruption(req: SimulationRequest):
    dis_id = f"DIS-{uuid.uuid4().hex[:6].upper()}"
    generate_recovery_workflow(dis_id, req.supplier_id, req.type, req.severity)
    
    return {
        "status": "SIMULATION_COMPLETE",
        "disruption_id": dis_id,
        "supplier_id": req.supplier_id,
        "disruption_type": req.type,
        "severity": req.severity,
        "message": "Disruption impact calculated. Request recommendations using the disruption_id."
    }

@router.get("/recommendations/{disruption_id}")
def get_recommendations(disruption_id: str):
    row = get_simulation(disruption_id)
    if not row:
        return {"error": "Disruption not found. Please simulate first."}
        
    alts = json.loads(row["alternatives"])
    rec = json.loads(row["recommended"])
    
    air_freight = next(o for o in alts if "Air Freight" in o["action"])
    
    return {
        "disruption_id": disruption_id,
        "recommended_option": rec,
        "green_resilience_score": rec["green_resilience_score"],
        "carbon_savings_kg": round(max(0, air_freight["carbon_impact"] - rec["carbon_impact"]), 2),
        "alternatives": alts
    }

@router.get("/recommendations/explain/{disruption_id}")
def explain_recommendation(disruption_id: str):
    row = get_simulation(disruption_id)
    if not row: return {"error": "Not found"}
    rec = json.loads(row["recommended"])
    
    why = [
        "Significantly lower carbon footprint vs emergency air freight.",
        f"Acceptable delay impact of {rec['delay_impact']} days.",
        f"Supplier risk profile is acceptable ({rec['risk_impact']})."
    ]
    return {
        "recommended_option": rec["action"],
        "why": why,
        "calculations": rec
    }
