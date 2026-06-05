import sys
import os
sys.path.append(os.path.dirname(__file__))

import json
from services.recommendation_engine import calculate_score, generate_recovery_workflow
from services.process_mining import analyze_process
import pandas as pd
import math

print("=== TASK 1 & 5: RECOMMENDATION VALIDATION & SCORING ===")
s1 = calculate_score(10000, 1000, 2, 0.1, 100000, 10000, 20)
print(f"Balanced (Low across board): {s1}%")

s2 = calculate_score(100000, 5000, 2, 0.1, 100000, 10000, 20)
print(f"Extreme Carbon (Max Carbon 100k): {s2}%")

s3 = calculate_score(2000, 500, 20, 0.1, 100000, 10000, 20)
print(f"Extreme Delay (Max Delay 20): {s3}%")

s4 = calculate_score(10000, 1000, 2, 0.9, 100000, 10000, 20)
print(f"Extreme Risk (0.9): {s4}%")

print("\n=== TASK 2: CARBON FORMULA VALIDATION ===")
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

dist = haversine(19.0760, 72.8777, 51.9225, 4.4791)
print(f"Mumbai to Rotterdam Distance: {dist:.2f} km")
weight = 2000 # kg
air_carbon = weight * dist * 1.25
print(f"2000kg Air Freight Carbon (No Mod): {air_carbon:.2f} kg CO2")
sea_carbon = weight * dist * 0.015
print(f"2000kg Sea Freight Carbon (No Mod): {sea_carbon:.2f} kg CO2")

print("\n=== TASK 3: PM4PY VALIDATION ===")
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
pm = analyze_process()
print(f"Total Cases Mined: {pm.get('total_cases')}")
print(f"Number of Variants Discovered: {len(pm.get('variants', []))}")
if pm.get('variants'):
    print(f"Top Variant: {pm['variants'][0]['variant']} (Freq: {pm['variants'][0]['frequency']})")
    print(f"Top Variant Carbon: {pm['variants'][0]['avg_carbon_kg']} kg")

print("\n=== TASK 4: POLICY VALIDATION ===")
os.chdir(os.path.dirname(__file__))
sup_df = pd.read_csv('../data/suppliers.csv')
sup_id = sup_df.iloc[0]['supplier_id']
rec = generate_recovery_workflow("SIM-1", sup_id, "PORT_STRIKE", 0.8)
for opt in rec['alternatives']:
    print(f"Action: {opt['action']}")
    print(f"  Carbon: {opt['carbon_impact']} | Violations: {opt['sustainability_violations']}")
