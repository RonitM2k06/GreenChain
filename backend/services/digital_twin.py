import pandas as pd
import os
import uuid
from .recommendation_engine import generate_recovery_workflow

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def calculate_supply_chain_resilience(delay, cost, risk, max_delay, max_cost):
    """
    Supply Chain Resilience Score (pure operational continuity, separate from Green Score).
    Measures: Recovery Speed (Delay), Continuity (Cost), Risk Exposure (Risk)
    """
    speed_score = 1 - (delay / max_delay) if max_delay > 0 else 0
    continuity_score = 1 - (cost / max_cost) if max_cost > 0 else 0
    risk_score = 1 - risk
    
    # 40% Speed, 40% Continuity, 20% Risk
    resilience = (0.4 * speed_score) + (0.4 * continuity_score) + (0.2 * risk_score)
    return round(max(0.0, min(1.0, resilience)) * 100, 1)

def run_digital_twin_simulation(supplier_id: str, disruption_type: str, severity: float):
    """
    Executes a single What-If Digital Twin Scenario.
    """
    disruption_id = f"DT-SIM-{str(uuid.uuid4())[:8]}"
    
    # We leverage the recommendation engine to generate the physical options
    base_result = generate_recovery_workflow(disruption_id, supplier_id, disruption_type, severity)
    
    # Inject pure operational Resilience Score
    options = base_result["alternatives"]
    max_delay = max([o["delay_impact"] for o in options] + [1])
    max_cost = max([o["cost_impact"] for o in options] + [1])
    
    for o in options:
        o["resilience_score"] = calculate_supply_chain_resilience(
            o["delay_impact"], o["cost_impact"], o["risk_impact"], max_delay, max_cost
        )
        
    # Resort by resilience if user wants, but we keep green resilience as recommended by default.
    return base_result
