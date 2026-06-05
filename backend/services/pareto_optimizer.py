import math

def calculate_pareto_front(strategies):
    pareto_front = []
    dominated = []
    
    for i, s1 in enumerate(strategies):
        is_dominated = False
        for j, s2 in enumerate(strategies):
            if i == j: continue
            
            c_dom = s2['carbon_impact'] <= s1['carbon_impact']
            cost_dom = s2['cost_impact'] <= s1['cost_impact']
            d_dom = s2['delay_impact'] <= s1['delay_impact']
            r_dom = s2['risk_impact'] <= s1['risk_impact']
            
            strict = (s2['carbon_impact'] < s1['carbon_impact'] or 
                      s2['cost_impact'] < s1['cost_impact'] or 
                      s2['delay_impact'] < s1['delay_impact'] or 
                      s2['risk_impact'] < s1['risk_impact'])
                      
            if c_dom and cost_dom and d_dom and r_dom and strict:
                is_dominated = True
                break
                
        if is_dominated:
            s1['is_pareto_optimal'] = False
            dominated.append(s1)
        else:
            s1['is_pareto_optimal'] = True
            pareto_front.append(s1)
            
    return pareto_front, dominated

def categorize_strategies(strategies):
    if not strategies: return {}
    
    min_c = min(s['carbon_impact'] for s in strategies)
    max_c = max(s['carbon_impact'] for s in strategies)
    min_cost = min(s['cost_impact'] for s in strategies)
    max_cost = max(s['cost_impact'] for s in strategies)
    min_d = min(s['delay_impact'] for s in strategies)
    max_d = max(s['delay_impact'] for s in strategies)
    
    lowest_carbon = min(strategies, key=lambda x: x['carbon_impact'])
    lowest_cost = min(strategies, key=lambda x: x['cost_impact'])
    fastest = min(strategies, key=lambda x: x['delay_impact'])
    lowest_risk = min(strategies, key=lambda x: x['risk_impact'])
    
    best_balanced = None
    min_dist = float('inf')
    
    for s in strategies:
        nc = (s['carbon_impact'] - min_c) / (max_c - min_c) if max_c > min_c else 0
        nco = (s['cost_impact'] - min_cost) / (max_cost - min_cost) if max_cost > min_cost else 0
        nd = (s['delay_impact'] - min_d) / (max_d - min_d) if max_d > min_d else 0
        
        dist = math.sqrt(nc**2 + nco**2 + nd**2)
        s['ideal_distance'] = round(dist, 3)
        if dist < min_dist:
            min_dist = dist
            best_balanced = s
            
    return {
        "lowest_carbon": lowest_carbon,
        "lowest_cost": lowest_cost,
        "fastest_recovery": fastest,
        "lowest_risk": lowest_risk,
        "best_balanced": best_balanced
    }
