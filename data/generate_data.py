import csv
import random
from datetime import datetime, timedelta
import uuid
import os
import math

os.chdir(os.path.dirname(os.path.abspath(__file__)))

LOCATIONS = {
    "Mumbai": (19.0760, 72.8777),
    "Chennai": (13.0827, 80.2707),
    "Pune": (18.5204, 73.8567),
    "Rotterdam": (51.9225, 4.4791),
    "Hamburg": (53.5511, 9.9937),
    "Zurich": (47.3769, 8.5417),
    "Shanghai": (31.2304, 121.4737),
    "Singapore": (1.3521, 103.8198)
}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def generate_suppliers(num=50):
    suppliers = []
    loc_names = list(LOCATIONS.keys())
    for i in range(num):
        loc = random.choice(loc_names)
        suppliers.append({
            "supplier_id": f"SUP-{i+1:03d}",
            "name": f"Supplier {chr(65 + (i % 26))}{i}",
            "location": loc,
            "lat": LOCATIONS[loc][0],
            "lon": LOCATIONS[loc][1],
            "risk_score": round(random.uniform(0.1, 0.9), 2),
            "esg_score": round(random.uniform(40, 95), 1),
            "base_carbon_rating": round(random.uniform(0.8, 1.2), 2)
        })
    return suppliers

def generate_warehouses(num=10):
    warehouses = []
    loc_names = ["Rotterdam", "Hamburg", "Zurich", "Mumbai", "Singapore"]
    for i in range(num):
        loc = random.choice(loc_names)
        warehouses.append({
            "warehouse_id": f"WH-{i+1:03d}",
            "location": loc,
            "lat": LOCATIONS[loc][0],
            "lon": LOCATIONS[loc][1]
        })
    return warehouses

def generate_shipments_and_logs(suppliers, warehouses, num=500):
    shipments = []
    event_logs = []
    modes = ["AIR", "SEA", "RAIL", "ROAD"]
    mode_carbon = {"AIR": 1.25, "SEA": 0.015, "RAIL": 0.02, "ROAD": 0.12}
    
    for i in range(num):
        sup = random.choice(suppliers)
        wh = random.choice(warehouses)
        
        distance = haversine(sup["lat"], sup["lon"], wh["lat"], wh["lon"])
        if distance < 50: distance = 50 # min dist
        
        mode = random.choices(modes, weights=[10, 50, 20, 20])[0]
        weight = random.randint(500, 5000)
        
        weight_tonnes = weight / 1000.0
        carbon = weight_tonnes * distance * mode_carbon[mode] * sup["base_carbon_rating"]
        cost = distance * (12 if mode == "AIR" else (0.5 if mode == "SEA" else 2)) + random.randint(500, 2000)
        delay = random.choices([0, 2, 5, 10], weights=[70, 15, 10, 5])[0]
        
        start_date = datetime.now() - timedelta(days=random.randint(30, 365))
        shipment_id = f"SHP-{uuid.uuid4().hex[:8]}"
        
        shipments.append({
            "shipment_id": shipment_id,
            "supplier_id": sup["supplier_id"],
            "warehouse_id": wh["warehouse_id"],
            "transport_mode": mode,
            "distance_km": round(distance, 2),
            "weight_kg": weight,
            "carbon_emissions_kg": round(carbon, 2),
            "cost_usd": round(cost, 2),
            "delay_days": delay,
            "dispatch_date": start_date.strftime("%Y-%m-%d")
        })
        
        # Event Logs for Process Mining
        t = start_date
        event_logs.append({"case_id": shipment_id, "activity": "PO Created", "timestamp": t.isoformat(), "carbon": 0})
        t += timedelta(days=random.randint(1, 3))
        
        if delay > 0:
            event_logs.append({"case_id": shipment_id, "activity": "Supplier Delay", "timestamp": t.isoformat(), "carbon": 0})
            t += timedelta(days=delay)
            
        event_logs.append({"case_id": shipment_id, "activity": "In Transit", "timestamp": t.isoformat(), "carbon": round(carbon, 2)})
        t += timedelta(days=int(distance / (800 if mode == "AIR" else 40) / 24) + 1)
        
        if random.random() < 0.2:
             event_logs.append({"case_id": shipment_id, "activity": "Customs Hold", "timestamp": t.isoformat(), "carbon": 0})
             t += timedelta(days=random.randint(1, 4))
             
        event_logs.append({"case_id": shipment_id, "activity": "Received", "timestamp": t.isoformat(), "carbon": 0})

    return shipments, event_logs

if __name__ == "__main__":
    suppliers = generate_suppliers(50)
    warehouses = generate_warehouses(10)
    shipments, event_logs = generate_shipments_and_logs(suppliers, warehouses, 500)
    
    def write_csv(name, data, fields):
        with open(name, 'w', newline='') as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows(data)
            
    write_csv("suppliers.csv", suppliers, ["supplier_id", "name", "location", "lat", "lon", "risk_score", "esg_score", "base_carbon_rating"])
    write_csv("warehouses.csv", warehouses, ["warehouse_id", "location", "lat", "lon"])
    write_csv("shipments.csv", shipments, ["shipment_id", "supplier_id", "warehouse_id", "transport_mode", "distance_km", "weight_kg", "carbon_emissions_kg", "cost_usd", "delay_days", "dispatch_date"])
    write_csv("event_log.csv", event_logs, ["case_id", "activity", "timestamp", "carbon"])
