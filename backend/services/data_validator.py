import pandas as pd

def validate_dataframe(df: pd.DataFrame, expected_columns: list):
    metrics = {
        "total_rows": len(df),
        "missing_columns": [],
        "null_values": 0,
        "duplicate_rows": 0,
        "negative_values": 0,
        "data_quality_score": 100.0
    }
    
    if df.empty:
        metrics["data_quality_score"] = 0.0
        return metrics

    # 1. Missing Columns
    for col in expected_columns:
        if col not in df.columns:
            metrics["missing_columns"].append(col)
            
    # 2. Null Values
    metrics["null_values"] = int(df.isnull().sum().sum())
    
    # 3. Duplicate Rows
    metrics["duplicate_rows"] = int(df.duplicated().sum())
    
    # 4. Negative Values (for numerical columns where negative makes no sense)
    num_cols = df.select_dtypes(include=['number']).columns
    for col in num_cols:
        metrics["negative_values"] += int((df[col] < 0).sum())
        
    # Calculate Data Quality Score
    penalty = 0
    if len(metrics["missing_columns"]) > 0:
        penalty += len(metrics["missing_columns"]) * 10 # 10 point penalty per missing column
        
    null_ratio = metrics["null_values"] / (len(df) * len(df.columns))
    penalty += null_ratio * 100 # percentage penalty
    
    dup_ratio = metrics["duplicate_rows"] / len(df)
    penalty += dup_ratio * 50
    
    neg_ratio = metrics["negative_values"] / (len(df) * len(num_cols)) if len(num_cols) > 0 else 0
    penalty += neg_ratio * 100
    
    metrics["data_quality_score"] = round(max(0.0, 100.0 - penalty), 1)
    
    return metrics
