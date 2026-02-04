import os
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.environ["MYSQL_HOST"],
            user=os.environ["MYSQL_USER"],
            password=os.environ["MYSQL_PASSWORD"],
            database=os.environ["MYSQL_DATABASE"],
            port=int(os.environ.get("MYSQL_PORT", 3306)),
            autocommit=True
        )
        return conn
    except Error as e:
        print("❌ MySQL connection failed:", e)
        return None


def fetch_all(query, params=None):
    conn = get_db_connection()
    if not conn:
        return []
    cur = conn.cursor(dictionary=True)
    cur.execute(query, params or ())
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows


def fetch_one(query, params=None):
    conn = get_db_connection()
    if not conn:
        return None
    cur = conn.cursor(dictionary=True)
    cur.execute(query, params or ())
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row


def execute(query, params=None):
    conn = get_db_connection()
    if not conn:
        return
    cur = conn.cursor()
    cur.execute(query, params or ())
    conn.commit()
    cur.close()
    conn.close()


# ---------------- CREATE TABLES ---------------- #

def create_all_tables():
    conn = get_db_connection()
    if not conn:
        return

    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS material_a_cost (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Material_A VARCHAR(255),
        Density_kg_dm3 VARCHAR(50),
        Price_per_kg_actual DECIMAL(15,4)
    ) ENGINE=InnoDB;
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS material_b_cost (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Material_B VARCHAR(255),
        Density_kg_dm3 VARCHAR(50),
        Price_per_kg_actual DECIMAL(15,4)
    ) ENGINE=InnoDB;
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS parts_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        internal_Project VARCHAR(255),
        vehicle_code VARCHAR(255),
        quotation_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    """)

    conn.commit()
    cur.close()
    conn.close()
