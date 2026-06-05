from fastapi import APIRouter
from services.decision_trace import generate_decision_trace
from services.recommendation_engine import generate_recovery_workflow
from services.pareto_optimizer import calculate_pareto_front
from services.governance import create_governance_review

router = APIRouter()

@router.get("/trace/{supplier_id}")
def get_trace(supplier_id: str, disruption_type: str = "PORT_STRIKE", severity: float = 0.8):
    # 1. Generate core strategies
    base_data = generate_recovery_workflow("TRACE-1", supplier_id, disruption_type, severity)
    
    # 2. Find Pareto
    p_front, p_dom = calculate_pareto_front(base_data['alternatives'])
    
    # 3. Build Trace
    trace = generate_decision_trace(base_data['alternatives'], p_front)
    
    # 4. Auto-create a Governance Review Draft
    review = create_governance_review(trace, "System Optimizer")
    
    return review
