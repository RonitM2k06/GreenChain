import sys
import os
import math

print("=== TASK 3: REGRESSION TEST ===")
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

dist = haversine(19.0760, 72.8777, 51.9225, 4.4791)
print(f"Distance: {dist:.2f} km")

weight_kg = 2000
weight_tonnes = weight_kg / 1000.0
air_factor = 1.25

expected = 17192.37
actual = weight_tonnes * dist * air_factor

print(f"Weight (tonnes): {weight_tonnes}")
print(f"Air Factor: {air_factor}")
print(f"Calculated Carbon: {actual:.2f} kg CO2")

diff = abs(actual - expected) / expected
print(f"Tolerance: {diff * 100:.4f}%")
if diff < 0.01:
    print("Regression Test: PASSED ✅")
else:
    print("Regression Test: FAILED ❌")
