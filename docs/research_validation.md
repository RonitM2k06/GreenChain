# Research Validation: Carbon-Aware Process Mining

## 1. Process Mining Integration
PM4Py is actively used to parse `event_log.csv` tracking supply chain events (`PO Created` -> `In Transit` -> `Received`). It discovers process variants, detects "Supplier Delay" or "Customs Hold" anomalies, and calculates throughput averages across the entire operation.

## 2. Carbon-Aware Analysis
Traditional process mining focuses on time and cost. Our novelty attaches environmental cost (CO2 kg) to the process edges (e.g., `In Transit`). The system isolates `Carbon Hotspots` by identifying which process variants contribute the highest CO2 footprint per execution.

## 3. Resilience Analysis
The system identifies disruptions and simulates recovery. Instead of applying static fallback values, it actively reads historical `weight_kg` and `distance_km` averages from the `shipments.csv` for the specific disrupted supplier to calculate realistic alternative constraints.

## 4. Research Novelty
The core contribution is the **Green Resilience Score**. It mathematically unifies environmental constraints (Carbon) with operational requirements (Cost, Delay, Risk) into a single objective function, solving the multi-objective optimization problem in sustainable crisis recovery.
