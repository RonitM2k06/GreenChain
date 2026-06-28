import sqlite3
import os

DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "simulations.db"))

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS simulations 
                        (id TEXT PRIMARY KEY, supplier_id TEXT, type TEXT, severity REAL, 
                         recommended_option TEXT, alternatives TEXT)''')

def save_simulation(dis_id, sup_id, dtype, sev, rec, alts):
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("INSERT OR REPLACE INTO simulations VALUES (?, ?, ?, ?, ?, ?)", 
                     (dis_id, sup_id, dtype, sev, rec, alts))

def get_simulation(dis_id):
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute("SELECT * FROM simulations WHERE id=?", (dis_id,))
        row = cur.fetchone()
        if row:
            return {"id": row[0], "supplier_id": row[1], "type": row[2], "severity": row[3], "recommended": row[4], "alternatives": row[5]}
    return None
