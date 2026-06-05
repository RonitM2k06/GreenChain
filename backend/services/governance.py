import uuid
from typing import List, Dict

# In-memory ledger for MVP
DECISION_LEDGER = []

def create_governance_review(trace_data: Dict, requested_by: str) -> Dict:
    review_id = str(uuid.uuid4())
    
    review = {
        "review_id": review_id,
        "status": "DRAFT", # DRAFT, REVIEW, APPROVED, REJECTED
        "requested_by": requested_by,
        "trace_data": trace_data,
        "comments": [],
        "approvals": []
    }
    DECISION_LEDGER.append(review)
    return review

def add_comment(review_id: str, user: str, role: str, text: str):
    for r in DECISION_LEDGER:
        if r['review_id'] == review_id:
            r['comments'].append({
                "comment_id": str(uuid.uuid4()),
                "user": user,
                "role": role,
                "text": text
            })
            return r
    return None

def approve_decision(review_id: str, user: str, role: str, reason: str):
    for r in DECISION_LEDGER:
        if r['review_id'] == review_id:
            r['approvals'].append({
                "user": user,
                "role": role,
                "reason": reason
            })
            r['status'] = "APPROVED"
            return r
    return None

def get_ledger():
    return DECISION_LEDGER
