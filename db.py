import os
import mysql.connector
from mysql.connector import Error

# ---------------- Database Connection ----------------

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("${{RAILWAY_PRIVATE_DOMAIN}}"),
            user=os.getenv("root"),
            password=os.getenv("DVadasUVYhvUOjNFXKzyeCgjouLCQqTn"),
            database=os.getenv("${{MYSQL_DATABASE}}"),
            port=int(os.getenv("MYSQL_PORT", 3306)),
            use_pure=True
        )
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# ---------------- Execute Query ----------------

def execute_query(query):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.execute(query)
            conn.commit()
        except Error as e:
            print(f"Error: {e}")
        finally:
            cursor.close()
            conn.close()

# ---------------- Create Tables ----------------

def create_material_B_Cost_table():
    query = """
    CREATE TABLE IF NOT EXISTS material_B_Cost (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Material_B VARCHAR(450),
        Density_kg_dm3 VARCHAR(100),
        FSS_Nr VARCHAR(100),
        Order_quantity_kg DECIMAL(15,3),
        Tracomb_PO_3142_percent DECIMAL(6,1),
        Tracomb_PO_3132_percent DECIMAL(6,1),
        Tracomb_PO_3170_percent DECIMAL(6,1),
        EVA_VS_430_percent DECIMAL(6,1),
        EVA_18002D_percent DECIMAL(6,1),
        EVA_Repsol_PA538_percent DECIMAL(6,1),
        Luvomaxx_LB_S_percent DECIMAL(6,1),
        Lotader_AX_8900_percent DECIMAL(6,1),
        Elvax_4260_percent DECIMAL(6,1),
        Evatane_2805_percent DECIMAL(6,1),
        Evatane_2825_percent DECIMAL(6,1),
        Irganox_1010_percent DECIMAL(6,1),
        Escorene_UL00728cc_percent DECIMAL(6,1),
        Price_per_kg_actual DECIMAL(15,4),
        Price_per_kg_old_1 DECIMAL(15,4),
        Price_per_kg_old_2 DECIMAL(15,4)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)

# (Repeat similar functions for all your other create_... tables)
# I’m including only a few below for brevity — you will include all you need:

def create_material_A_Cost_table():
    query = """
    CREATE TABLE IF NOT EXISTS material_A_Cost (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Material_A VARCHAR(450),
        Density_kg_dm3 VARCHAR(100),
        FSS_Nr VARCHAR(100),
        Order_quantity_kg DECIMAL(15,3),
        Price_per_kg_actual DECIMAL(15,4),
        Price_per_kg_old_1 DECIMAL(15,4),
        Price_per_kg_old_2 DECIMAL(15,4)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)

def create_parts_project_table():
    query = """
    CREATE TABLE IF NOT EXISTS parts_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        internal_Project VARCHAR(255),
        vehicle_code VARCHAR(255),
        OEM_SOP VARCHAR(255),
        henkel_PL VARCHAR(255),
        quotation_date DATE,
        quotation_rev_level INT,
        supplier VARCHAR(255),
        supplier_contact VARCHAR(15),
        LCUR_for_quotation VARCHAR(255),
        LCUR_abbreviation VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)

# (include other create_… functions the same way)

def create_all_tables():
    create_material_B_Cost_table()
    create_material_A_Cost_table()
    create_parts_project_table()
    # add all your other create_… functions here

# ---------------- Fetch / Execute Helpers ----------------

def fetch_all(query, params=None):
    conn = get_db_connection()
    if not conn:
        return []
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params or ())
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

def fetch_one(query, params=None):
    conn = get_db_connection()
    if not conn:
        return None
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params or ())
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row

def execute(query, params=None):
    conn = get_db_connection()
    if not conn:
        return
    cursor = conn.cursor()
    cursor.execute(query, params or ())
    conn.commit()
    cursor.close()
    conn.close()
