import uuid
from typing import List, Dict

def generate_decision_trace(strategies: List[Dict], pareto_front: List[Dict]) -> Dict:
    trace_id = str(uuid.uuid4())
    
    annotated_strategies = []
    
    pareto_actions = [p['action'] for p in pareto_front]
    
    worst_carbon = max([s['carbon_impact'] for s in strategies]) if strategies else 0
    worst_action = next((s['action'] for s in strategies if s['carbon_impact'] == worst_carbon), "Baseline")
    
    for s in strategies:
        is_pareto = s['action'] in pareto_actions
        explanation = ""
        
        # Policy checks
        budget_violation = bool(s['carbon_impact'] > 2000)
        delay_violation = bool(s['delay_impact'] > 14)
        
        if is_pareto:
            explanation = "Selected because it mathematically lies on the optimal efficiency frontier."
            if s['carbon_impact'] == min([p['carbon_impact'] for p in pareto_front]):
                explanation = "Selected as the absolute lowest carbon option on the Pareto Front."
            elif s['delay_impact'] == min([p['delay_impact'] for p in pareto_front]):
                explanation = "Selected as the absolute fastest recovery option on the Pareto Front."
        else:
            # Find what dominates it
            dominator = pareto_front[0]
            for p in pareto_front:
                if p['carbon_impact'] <= s['carbon_impact'] and p['delay_impact'] <= s['delay_impact'] and p['cost_impact'] <= s['cost_impact']:
                    dominator = p
                    break
                    
            explanation = f"Rejected because it is mathematically dominated by {dominator['action']}."
            
            if budget_violation:
                explanation += f" Furthermore, carbon budget was exceeded by {(s['carbon_impact'] - 2000):.1f} kg."
                
        # Calculate confidence score
        base_confidence = 95 if is_pareto else 30
        if budget_violation: base_confidence -= 20
        if delay_violation: base_confidence -= 20
        # Adjust for risk
        base_confidence -= int(s['risk_impact'] * 20)
        confidence_score = max(0, min(100, base_confidence))

        # Counterfactual analysis
        counterfactual = None
        if is_pareto and s['carbon_impact'] < worst_carbon:
            saved = worst_carbon - s['carbon_impact']
            counterfactual = {
                "worst_alternative": worst_action,
                "worst_carbon": worst_carbon,
                "carbon_saved": saved,
                "statement": f"If {worst_action} was chosen instead, the supply chain would have emitted {saved:.1f} kg MORE carbon."
            }

        annotated_strategies.append({
            **s,
            "is_pareto": is_pareto,
            "explanation": explanation,
            "confidence_score": confidence_score,
            "counterfactual": counterfactual,
            "policy_violations": {
                "carbon": budget_violation,
                "delay": delay_violation
            }
        })
        
    return {
        "trace_id": trace_id,
        "timestamp": "2026-06-05T20:00:00Z", # Mocked for MVP
        "total_evaluated": len(strategies),
        "pareto_optimal_count": len(pareto_front),
        "annotated_strategies": annotated_strategies
    }
