from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

@router.get("/")
def get_suppliers():
    try:
        suppliers = pd.read_csv(os.path.join(DATA_DIR, "suppliers.csv"))
        return suppliers.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}
