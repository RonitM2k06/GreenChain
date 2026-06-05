from fastapi import APIRouter
from pydantic import BaseModel
from services.governance import get_ledger, create_governance_review, add_comment, approve_decision

router = APIRouter()

class CommentReq(BaseModel):
    user: str
    role: str
    text: str

class ApproveReq(BaseModel):
    user: str
    role: str
    reason: str

@router.get("/ledger")
def fetch_ledger():
    return get_ledger()

@router.post("/{review_id}/comment")
def post_comment(review_id: str, req: CommentReq):
    return add_comment(review_id, req.user, req.role, req.text)

@router.post("/{review_id}/approve")
def post_approval(review_id: str, req: ApproveReq):
    return approve_decision(review_id, req.user, req.role, req.reason)
