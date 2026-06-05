from fastapi import APIRouter
from services.alert_engine import generate_active_alerts, get_alert_history

router = APIRouter()

@router.get("/")
def get_all_alerts():
    return generate_active_alerts()

@router.get("/critical")
def get_critical_alerts():
    alerts = generate_active_alerts()
    return [a for a in alerts if a['severity'] == 'CRITICAL']

@router.get("/history")
def get_history():
    return get_alert_history()
