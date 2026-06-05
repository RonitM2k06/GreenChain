import pandas as pd
import pm4py
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def analyze_process():
    log_path = os.path.join(DATA_DIR, "event_log.csv")
    if not os.path.exists(log_path):
        return {"error": "Event log not found"}

    df = pd.read_csv(log_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    analysis_df = df.copy()
    
    # Use PM4Py to discover variants
    pm4py_df = pm4py.format_dataframe(df, case_id='case_id', activity_key='activity', timestamp_key='timestamp')
    variants = pm4py.get_variants_as_tuples(pm4py_df)
    
    # Calculate carbon totals per case
    case_carbon = analysis_df.groupby('case_id')['carbon'].sum().to_dict()
    
    # Calculate the exact variant tuple for each case
    case_variants = {}
    for name, group in analysis_df.sort_values('timestamp').groupby('case_id'):
        var_tuple = tuple(group['activity'].tolist())
        case_variants[name] = var_tuple
        
    # Group carbon by variant
    variant_carbon_totals = {}
    variant_case_counts = {}
    for case_id, var_tuple in case_variants.items():
        if var_tuple not in variant_carbon_totals:
            variant_carbon_totals[var_tuple] = 0
            variant_case_counts[var_tuple] = 0
        variant_carbon_totals[var_tuple] += case_carbon.get(case_id, 0)
        variant_case_counts[var_tuple] += 1

    variant_stats = []
    baseline_carbon = 0
    # Map PM4Py's discovered variants to our carbon calculations
    for var_tuple, count in variants.items():
        var_name = " -> ".join(var_tuple)
        var_carbon_total = variant_carbon_totals.get(var_tuple, 0)
        var_case_count = variant_case_counts.get(var_tuple, 0)
        avg_carbon = var_carbon_total / var_case_count if var_case_count > 0 else 0
        
        variant_stats.append({
            "variant": var_name,
            "frequency": count,
            "avg_carbon_kg": round(avg_carbon, 2)
        })
        
    variant_stats = sorted(variant_stats, key=lambda x: x['frequency'], reverse=True)
    if variant_stats:
        baseline_carbon = variant_stats[0]['avg_carbon_kg']
        
    cycle_times = []
    delays = {"Supplier Delay": 0, "Customs Hold": 0}
    delay_freq = {"Supplier Delay": 0, "Customs Hold": 0}

    grouped = analysis_df.groupby('case_id')
    for name, group in grouped:
        group = group.sort_values('timestamp')
        st = group['timestamp'].min()
        et = group['timestamp'].max()
        cycle_times.append((et - st).total_seconds() / 86400)
        
        acts = group['activity'].tolist()
        for i, act in enumerate(acts):
            if act in delays and i < len(acts)-1:
                t1 = group.iloc[i]['timestamp']
                t2 = group.iloc[i+1]['timestamp']
                diff = (t2 - t1).total_seconds() / 86400
                delays[act] += diff
                delay_freq[act] += 1
                
    avg_cycle = sum(cycle_times) / len(cycle_times) if cycle_times else 0
    
    bottlenecks = []
    for k, v in delays.items():
        if delay_freq[k] > 0:
            bottlenecks.append({
                "activity": k,
                "avg_delay_days": round(v / delay_freq[k], 1),
                "frequency": delay_freq[k]
            })
    bottlenecks = sorted(bottlenecks, key=lambda x: x['avg_delay_days'], reverse=True)

    hotspots = sorted(variant_stats, key=lambda x: x['avg_carbon_kg'], reverse=True)[:3]
    
    story = []
    highest_carbon = hotspots[0] if hotspots else None
    if highest_carbon and baseline_carbon > 0 and highest_carbon['variant'] != variant_stats[0]['variant']:
        diff_pct = ((highest_carbon['avg_carbon_kg'] - baseline_carbon) / baseline_carbon) * 100
        if diff_pct > 0:
            story.append(f"The '{highest_carbon['variant']}' path generated {round(diff_pct, 1)}% more carbon than the baseline variant.")
            
    if bottlenecks:
        worst = bottlenecks[0]
        story.append(f"The '{worst['activity']}' activity contributed significantly to overall cycle time extensions, averaging {worst['avg_delay_days']} days delay per occurrence.")
            
    story.append(f"Process mining identified {len(variant_stats)} distinct execution paths across {len(grouped)} historical shipments.")

    return {
        "total_cases": len(grouped),
        "variants": variant_stats,
        "avg_cycle_time_days": round(avg_cycle, 2),
        "carbon_hotspots": hotspots,
        "bottlenecks": bottlenecks,
        "storytelling": story
    }
