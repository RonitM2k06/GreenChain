from fastapi import APIRouter
from services.process_mining import analyze_process

router = APIRouter()

@router.get("/summary")
def get_pm_summary():
    return analyze_process()
