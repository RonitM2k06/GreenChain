from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

@router.get("/kpis")
def get_kpis():
    try:
        shipments = pd.read_csv(os.path.join(DATA_DIR, "shipments.csv"))
        suppliers = pd.read_csv(os.path.join(DATA_DIR, "suppliers.csv"))
        disruptions = pd.read_csv(os.path.join(DATA_DIR, "disruptions.csv"))
        
        total_emissions = shipments["carbon_emissions_kg"].sum()
        avg_esg = suppliers["esg_score"].mean()
        active_disruptions = len(disruptions[disruptions["status"] == "ACTIVE"])
        
        return {
            "total_emissions_kg": round(total_emissions, 2),
            "esg_avg": round(avg_esg, 2),
            "active_disruptions": active_disruptions,
            "resilience_score": 85.4
        }
    except Exception as e:
        return {"error": str(e)}
