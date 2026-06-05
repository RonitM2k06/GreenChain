def calculate_green_resilience_score(carbon: float, cost: float, delay: float, risk: float, 
                                    max_carbon: float, max_cost: float, max_delay: float) -> float:
    """
    Phase 4: Recommendation Engine - Green Resilience Score
    Returns score 0-100 where 100 is best.
    """
    n_carbon = 1 - (carbon / max_carbon) if max_carbon > 0 else 0
    n_cost = 1 - (cost / max_cost) if max_cost > 0 else 0
    n_delay = 1 - (delay / max_delay) if max_delay > 0 else 0
    n_risk = 1 - risk
    
    # Weights for multi-objective optimization
    W_CARBON = 0.40
    W_COST = 0.25
    W_DELAY = 0.25
    W_RISK = 0.10
    
    score = (W_CARBON * n_carbon) + (W_COST * n_cost) + (W_DELAY * n_delay) + (W_RISK * n_risk)
    
    final_score = max(0.0, min(1.0, score)) * 100
    return round(final_score, 1)

def generate_recovery_options(supplier_id: str, disruption_type: str, severity: float):
    # Mocking base impact based on severity (0.0 to 1.0)
    base_delay = 10 * severity
    base_cost = 50000 * severity
    base_carbon = 5000 * severity

    options = [
        {
            "id": "OPT-1",
            "action": "Emergency Air Freight",
            "carbon_impact": round(base_carbon * 5.0, 2),
            "cost_impact": round(base_cost * 3.0, 2),
            "delay_impact": max(1, round(base_delay * 0.2, 1)),
            "risk_impact": 0.2
        },
        {
            "id": "OPT-2",
            "action": "Alternative Supplier (Local)",
            "carbon_impact": round(base_carbon * 0.8, 2),
            "cost_impact": round(base_cost * 1.5, 2),
            "delay_impact": round(base_delay * 0.8, 1),
            "risk_impact": 0.1
        },
        {
            "id": "OPT-3",
            "action": "Sea Freight Re-routing",
            "carbon_impact": round(base_carbon * 0.3, 2),
            "cost_impact": round(base_cost * 0.5, 2),
            "delay_impact": round(base_delay * 2.0, 1),
            "risk_impact": 0.4
        }
    ]
    
    max_c = max(o["carbon_impact"] for o in options)
    max_cost = max(o["cost_impact"] for o in options)
    max_d = max(o["delay_impact"] for o in options)
    
    for opt in options:
        opt["green_resilience_score"] = calculate_green_resilience_score(
            opt["carbon_impact"], opt["cost_impact"], opt["delay_impact"], opt["risk_impact"],
            max_c, max_cost, max_d
        )
        
    options = sorted(options, key=lambda x: x["green_resilience_score"], reverse=True)
    
    if options:
        options[0]["recommended"] = True
        for o in options[1:]:
            o["recommended"] = False
            
    return options
