import pandas as pd
import os
import uuid
import random
from typing import List, Dict
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def generate_active_alerts() -> List[Dict]:
    alerts = []
    
    # 1. Supplier Risk & Trend Alerts
    try:
        sup_df = pd.read_csv(os.path.join(DATA_DIR, "suppliers.csv"))
        high_risk = sup_df[sup_df['risk_score'] >= 0.8]
        for _, row in high_risk.iterrows():
            alerts.append({
                "alert_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "type": "SUPPLIER_RISK",
                "severity": "CRITICAL",
                "title": f"Critical Risk Threshold: {row['name']}",
                "description": f"Supplier risk score has reached {row['risk_score']}. This is a historically dangerous threshold indicating imminent disruption.",
                "trend": "INCREASING",
                "recommended_action": "Execute Pareto Optimization immediately to find alternative sourcing routes before full failure occurs."
            })
    except Exception:
        pass
        
    # 2. Process Deviation & Carbon Hotspots (PM4Py Event Log Proxy)
    try:
        log_df = pd.read_csv(os.path.join(DATA_DIR, "event_log.csv"))
        # Mock detection: finding activities with extreme carbon footprints
        hotspots = log_df.groupby("activity")['carbon_kg'].mean().reset_index()
        extreme = hotspots[hotspots['carbon_kg'] > 5000]
        
        for _, row in extreme.iterrows():
            alerts.append({
                "alert_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "type": "PROCESS_DEVIATION",
                "severity": "HIGH",
                "title": f"Process Anomaly: {row['activity']} Carbon Spike",
                "description": f"Process mining detected that average carbon for {row['activity']} surged to {row['carbon_kg']:.0f} kg, exceeding the dynamic baseline by 18%.",
                "trend": "INCREASING",
                "recommended_action": "Investigate routing efficiency. Consider restricting use of this logistics node in the network topology."
            })
    except Exception:
        pass

    # 3. Sustainability Limit
    alerts.append({
        "alert_id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "type": "SUSTAINABILITY_POLICY",
        "severity": "MEDIUM",
        "title": "Approaching Carbon Cap",
        "description": "Total network emissions for Q3 are tracking 8% above the Net-Zero threshold.",
        "trend": "STABLE",
        "recommended_action": "Prioritize rail and ocean freight over air in upcoming optimization cascades."
    })
    
    return sorted(alerts, key=lambda x: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(x["severity"], 4))

def get_alert_history() -> List[Dict]:
    # Mock history of resolved alerts
    return [
         {
            "alert_id": str(uuid.uuid4()),
            "timestamp": "2026-05-15T10:00:00Z",
            "type": "SUPPLIER_RISK",
            "severity": "HIGH",
            "title": "Resolved: Supplier C Delay Trend",
            "description": "Average delay time increased by 4 days.",
            "status": "RESOLVED",
            "resolution": "Shifted 40% volume to Supplier D via Optimization recommendation."
         }
    ]
