import pandas as pd
import os
import json
from .storage import save_simulation
from config.transport_factors import TRANSPORT_MODES

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def calculate_score(carbon, cost, delay, risk, mc, mcost, mdelay):
    n_carbon = 1 - (carbon / mc) if mc > 0 else 0
    n_cost = 1 - (cost / mcost) if mcost > 0 else 0
    n_delay = 1 - (delay / mdelay) if mdelay > 0 else 0
    n_risk = 1 - risk
    score = (0.40 * n_carbon) + (0.25 * n_cost) + (0.25 * n_delay) + (0.10 * n_risk)
    return round(max(0.0, min(1.0, score)) * 100, 1)

def generate_recovery_workflow(disruption_id: str, supplier_id: str, disruption_type: str, severity: float):
    sup_df = pd.read_csv(os.path.join(DATA_DIR, "suppliers.csv"))
    shp_df = pd.read_csv(os.path.join(DATA_DIR, "shipments.csv"))
    
    sup = sup_df[sup_df['supplier_id'] == supplier_id].iloc[0]
    
    sup_shipments = shp_df[shp_df['supplier_id'] == supplier_id]
    if not sup_shipments.empty:
        avg_weight = sup_shipments['weight_kg'].mean()
        avg_dist = sup_shipments['distance_km'].mean()
    else:
        avg_weight = 2000
        avg_dist = 5000
        
    alt_sups = sup_df[sup_df['supplier_id'] != supplier_id].sort_values('esg_score', ascending=False)
    alt_sup = alt_sups.iloc[0]
    
    avg_weight_tonnes = avg_weight / 1000.0
    
    options = []
    base_id = 1
    for mode in ["AIR", "SEA", "RAIL", "ROAD"]:
        # Orig Supplier
        c = avg_weight_tonnes * avg_dist * TRANSPORT_MODES[mode]["emission_factor"] * sup['base_carbon_rating']
        cost = avg_dist * TRANSPORT_MODES[mode]["cost_factor"] * (1 + severity * 0.5)
        # Delay proxy: higher speed = lower delay. Sea is slow, Air is fast.
        base_delay = 500 / TRANSPORT_MODES[mode]["speed_kmh"]
        delay = base_delay * (1 + severity) + 1
        options.append({"id": f"OPT-{base_id}", "action": f"Current Supplier ({mode})", "carbon_impact": c, "cost_impact": cost, "delay_impact": delay, "risk_impact": sup['risk_score']})
        base_id += 1
        
        # Alt Supplier
        c_alt = avg_weight_tonnes * (avg_dist * 1.1) * TRANSPORT_MODES[mode]["emission_factor"] * alt_sup['base_carbon_rating']
        cost_alt = (avg_dist * 1.1) * TRANSPORT_MODES[mode]["cost_factor"] * (1 + severity * 0.5) + 2000
        delay_alt = base_delay * (1 + severity) + 4
        options.append({"id": f"OPT-{base_id}", "action": f"Alt Supplier {alt_sup['supplier_id']} ({mode})", "carbon_impact": c_alt, "cost_impact": cost_alt, "delay_impact": delay_alt, "risk_impact": alt_sup['risk_score']})
        base_id += 1

    # Hybrid 1: Multi-Supplier (50% Orig Sea, 50% Alt Air)
    opt_orig_sea = next(o for o in options if o["action"] == "Current Supplier (SEA)")
    opt_alt_air = next(o for o in options if "Alt Supplier" in o["action"] and "(AIR)" in o["action"])
    options.append({
        "id": f"OPT-{base_id}", "action": "Multi-Supplier Hybrid (Sea/Air)", 
        "carbon_impact": (opt_orig_sea["carbon_impact"] + opt_alt_air["carbon_impact"]) / 2.0, 
        "cost_impact": (opt_orig_sea["cost_impact"] + opt_alt_air["cost_impact"]) / 2.0, 
        "delay_impact": min(opt_orig_sea["delay_impact"], opt_alt_air["delay_impact"]), 
        "risk_impact": (sup['risk_score'] + alt_sup['risk_score']) / 2.0
    })
    base_id += 1

    # Hybrid 2: Hybrid Route (Orig Air/Sea split)
    opt_orig_air = next(o for o in options if o["action"] == "Current Supplier (AIR)")
    options.append({
        "id": f"OPT-{base_id}", "action": "Hybrid Route (Orig Air/Sea)", 
        "carbon_impact": (opt_orig_sea["carbon_impact"] + opt_orig_air["carbon_impact"]) / 2.0, 
        "cost_impact": (opt_orig_sea["cost_impact"] + opt_orig_air["cost_impact"]) / 2.0, 
        "delay_impact": opt_orig_air["delay_impact"] + 1, 
        "risk_impact": sup['risk_score']
    })

    mc = max(o['carbon_impact'] for o in options)
    mcost = max(o['cost_impact'] for o in options)
    mdelay = max(o['delay_impact'] for o in options)

    for o in options:
        o['green_resilience_score'] = calculate_score(o['carbon_impact'], o['cost_impact'], o['delay_impact'], o['risk_impact'], mc, mcost, mdelay)
        o['carbon_impact'] = round(o['carbon_impact'], 2)
        o['cost_impact'] = round(o['cost_impact'], 2)
        o['delay_impact'] = round(o['delay_impact'], 1)
        o['risk_impact'] = round(o['risk_impact'], 2)
        
        # Policy Constraints
        violations = []
        if o['carbon_impact'] > 2000:
            violations.append(f"Exceeds Carbon Budget by {round(o['carbon_impact'] - 2000, 2)}kg")
        if o['delay_impact'] > 14:
            violations.append(f"Exceeds Max Delay by {o['delay_impact'] - 14} days")
        if "Alt Supplier" in o['action'] and alt_sup['esg_score'] < 70:
            violations.append(f"Supplier ESG Score ({alt_sup['esg_score']}) is below minimum 70")
            
        o['sustainability_violations'] = violations

    options.sort(key=lambda x: x['green_resilience_score'], reverse=True)
    options[0]['recommended'] = True
    for o in options[1:]: o['recommended'] = False

    result = {
        "disruption_id": disruption_id,
        "recommended_option": options[0],
        "green_resilience_score": options[0]['green_resilience_score'],
        "alternatives": options
    }
    
    save_simulation(disruption_id, supplier_id, disruption_type, severity, json.dumps(options[0]), json.dumps(options))
    return result
