from fastapi import APIRouter
from pydantic import BaseModel
from services.recommendation_engine import generate_recovery_workflow
from services.pareto_optimizer import calculate_pareto_front, categorize_strategies
import uuid

router = APIRouter()

class OptimizationRequest(BaseModel):
    supplier_id: str
    disruption_type: str
    severity: float

@router.post("/pareto")
def get_pareto_optimization(req: OptimizationRequest):
    disruption_id = f"OPT-{str(uuid.uuid4())[:8]}"
    
    # 1. Generate massive strategy space
    sim = generate_recovery_workflow(disruption_id, req.supplier_id, req.disruption_type, req.severity)
    strategies = sim['alternatives']
    
    # 2. Pareto optimization
    pareto_front, dominated = calculate_pareto_front(strategies)
    
    # 3. Categorize
    categories = categorize_strategies(strategies)
    
    # 4. Generate Insights
    insights = [
        f"The lowest-carbon strategy emits {categories['lowest_carbon']['carbon_impact']}kg but increases delay by {round(categories['lowest_carbon']['delay_impact'] - categories['fastest_recovery']['delay_impact'], 1)} days vs the fastest option.",
        f"The fastest recovery strategy costs ${categories['fastest_recovery']['cost_impact']} and emits {round(categories['fastest_recovery']['carbon_impact'] / categories['lowest_carbon']['carbon_impact'], 1)}x more CO₂.",
        f"The best balanced strategy reduces emissions while keeping delay to {categories['best_balanced']['delay_impact']} days."
    ]
    
    return {
        "disruption_id": disruption_id,
        "total_strategies": len(strategies),
        "pareto_front": pareto_front,
        "dominated_strategies": dominated,
        "categories": categories,
        "insights": insights
    }
