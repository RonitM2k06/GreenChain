import pandas as pd
import io

class BaseAdapter:
    def __init__(self, raw_data: bytes, filename: str):
        self.raw_data = raw_data
        self.filename = filename

    def extract(self) -> pd.DataFrame:
        raise NotImplementedError()

class SAPERPAdapter(BaseAdapter):
    """
    Mock Adapter for SAP ERP tables (e.g., LFA1 for vendors, EKKO for purchasing).
    In a real implementation, this would connect via OData or RFC.
    """
    def extract(self) -> pd.DataFrame:
        # Simulate parsing an SAP export into a standard DataFrame
        if self.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(self.raw_data))
        elif self.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(self.raw_data))
        else:
            raise ValueError("Unsupported format for SAP Import")
            
        # Example Mapping logic that would happen here:
        # df.rename(columns={"LIFNR": "supplier_id", "NAME1": "name", "ORT01": "location"}, inplace=True)
        return df

class CelonisOCELAdapter(BaseAdapter):
    """
    Mock Adapter for Celonis EMS / OCEL (Object-Centric Event Logs).
    """
    def extract(self) -> pd.DataFrame:
        df = pd.read_csv(io.BytesIO(self.raw_data))
        # Celonis standard mapping
        # df.rename(columns={"_CASE_KEY": "case_id", "ACTIVITY_EN": "activity", "EVENT_TIME": "timestamp"}, inplace=True)
        return df

class OracleSCMAdapter(BaseAdapter):
    """
    Mock Adapter for Oracle Supply Chain Management exports.
    """
    def extract(self) -> pd.DataFrame:
        df = pd.read_csv(io.BytesIO(self.raw_data))
        return df

def get_adapter(source_system: str, raw_data: bytes, filename: str) -> BaseAdapter:
    if source_system == "SAP":
        return SAPERPAdapter(raw_data, filename)
    elif source_system == "CELONIS":
        return CelonisOCELAdapter(raw_data, filename)
    elif source_system == "ORACLE":
        return OracleSCMAdapter(raw_data, filename)
    else:
        # Default CSV adapter
        return SAPERPAdapter(raw_data, filename)
