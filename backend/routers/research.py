from fastapi import APIRouter
from research.experiment_runner import run_research_experiment
import os
import json

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
RESULTS_DIR = os.path.join(DATA_DIR, "research")

@router.post("/run")
def run_experiment(count: int = 500, seed: int = 42):
    try:
        results = run_research_experiment(count, seed)
        return {"status": "success", "results": results}
    except Exception as e:
        return {"error": str(e)}

@router.get("/results")
def get_results():
    try:
        with open(os.path.join(RESULTS_DIR, "research_results.json"), "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        return {"error": "No experiment results found. Run /run first."}
