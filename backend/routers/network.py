from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

@router.get("/")
def get_network():
    try:
        suppliers = pd.read_csv(os.path.join(DATA_DIR, "suppliers.csv")).to_dict(orient="records")
        warehouses = pd.read_csv(os.path.join(DATA_DIR, "warehouses.csv")).to_dict(orient="records")
        return {
            "suppliers": suppliers,
            "warehouses": warehouses
        }
    except Exception as e:
        return {"error": str(e)}
