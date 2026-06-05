from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import os
import shutil
from typing import Optional
from integrations.adapters import get_adapter
from services.data_validator import validate_dataframe

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CUSTOM_DIR = os.path.join(DATA_DIR, "custom")
DEMO_DIR = os.path.join(DATA_DIR, "demo")

# Ensure dirs exist
os.makedirs(CUSTOM_DIR, exist_ok=True)
os.makedirs(DEMO_DIR, exist_ok=True)

class SwitchRequest(BaseModel):
    mode: str  # 'demo' or 'custom'

@router.post("/upload")
async def upload_data(
    file: UploadFile = File(...),
    source_system: str = Form("DEFAULT"),
    dataset_type: str = Form("suppliers")  # 'suppliers', 'event_log', 'shipments'
):
    try:
        contents = await file.read()
        
        # 1. Adapt and Extract
        adapter = get_adapter(source_system, contents, file.filename)
        df = adapter.extract()
        
        # 2. Validate
        expected_cols = []
        if dataset_type == "suppliers":
            expected_cols = ["supplier_id", "name", "location", "risk_score", "carbon_rating", "tier"]
        elif dataset_type == "event_log":
            expected_cols = ["case_id", "activity", "timestamp", "resource", "carbon_kg"]
            
        validation_metrics = validate_dataframe(df, expected_cols)
        
        # 3. Save to Custom Dir
        custom_path = os.path.join(CUSTOM_DIR, f"{dataset_type}.csv")
        df.to_csv(custom_path, index=False)
        
        # Also immediately overwrite the main dataset if they are uploading so it updates live
        main_path = os.path.join(DATA_DIR, f"{dataset_type}.csv")
        # Backup demo if not exist
        demo_path = os.path.join(DEMO_DIR, f"{dataset_type}.csv")
        if os.path.exists(main_path) and not os.path.exists(demo_path):
            shutil.copy(main_path, demo_path)
            
        df.to_csv(main_path, index=False)
        
        return {
            "status": "success",
            "message": f"Successfully ingested {len(df)} records from {source_system}.",
            "quality_metrics": validation_metrics
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/switch-dataset")
async def switch_dataset(req: SwitchRequest):
    files_to_switch = ["suppliers.csv", "event_log.csv", "shipments.csv"]
    
    source_dir = DEMO_DIR if req.mode == "demo" else CUSTOM_DIR
    
    switched = []
    for f in files_to_switch:
        src = os.path.join(source_dir, f)
        dst = os.path.join(DATA_DIR, f)
        if os.path.exists(src):
            shutil.copy(src, dst)
            switched.append(f)
            
    return {"status": "success", "mode": req.mode, "files_switched": switched}
