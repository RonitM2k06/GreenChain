import random
import pandas as pd
import os
from .digital_twin import run_digital_twin_simulation

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def generate_batch_scenarios(n: int):
    sup_df = pd.read_csv(os.path.join(DATA_DIR, "suppliers.csv"))
    supplier_ids = sup_df['supplier_id'].tolist()
    disruption_types = ["PORT_STRIKE", "WEATHER", "FACTORY_FIRE", "COMPONENT_SHORTAGE", "TRANSPORT_DELAY"]
    
    scenarios = []
    for _ in range(n):
        scenarios.append({
            "supplier_id": random.choice(supplier_ids),
            "type": random.choice(disruption_types),
            "severity": round(random.uniform(0.5, 1.0), 2)
        })
    return scenarios

def run_batch_simulation(n: int):
    scenarios = generate_batch_scenarios(n)
    
    # Track metrics for each strategy type
    strategies = {
        "Emergency Air Freight": {"carbon": [], "cost": [], "delay": [], "resilience": [], "green": [], "violations": 0},
        "Alt Supplier": {"carbon": [], "cost": [], "delay": [], "resilience": [], "green": [], "violations": 0},
        "Alternative Route (Rail)": {"carbon": [], "cost": [], "delay": [], "resilience": [], "green": [], "violations": 0}
    }
    
    for sc in scenarios:
        sim_result = run_digital_twin_simulation(sc['supplier_id'], sc['type'], sc['severity'])
        for opt in sim_result['alternatives']:
            # map option action to core strategy category
            action_cat = opt['action']
            if "Alt Supplier" in action_cat:
                action_cat = "Alt Supplier"
            
            if action_cat in strategies:
                strategies[action_cat]["carbon"].append(opt["carbon_impact"])
                strategies[action_cat]["cost"].append(opt["cost_impact"])
                strategies[action_cat]["delay"].append(opt["delay_impact"])
                strategies[action_cat]["resilience"].append(opt.get("resilience_score", 0))
                strategies[action_cat]["green"].append(opt["green_resilience_score"])
                if opt.get("sustainability_violations") and len(opt["sustainability_violations"]) > 0:
                    strategies[action_cat]["violations"] += 1
                    
    # Compile benchmark results
    benchmark = []
    for action, metrics in strategies.items():
        if len(metrics["carbon"]) == 0:
            continue
        count = len(metrics["carbon"])
        avg_carbon = sum(metrics["carbon"]) / count
        avg_cost = sum(metrics["cost"]) / count
        avg_delay = sum(metrics["delay"]) / count
        avg_resilience = sum(metrics["resilience"]) / count
        avg_green = sum(metrics["green"]) / count
        compliance_rate = 100.0 - ((metrics["violations"] / count) * 100.0)
        
        benchmark.append({
            "strategy": action,
            "avg_carbon_kg": round(avg_carbon, 2),
            "avg_cost": round(avg_cost, 2),
            "avg_delay_days": round(avg_delay, 1),
            "avg_resilience_score": round(avg_resilience, 1),
            "avg_green_score": round(avg_green, 1),
            "compliance_rate": round(compliance_rate, 1)
        })
        
    return {
        "simulations_run": n,
        "benchmarks": benchmark
    }
