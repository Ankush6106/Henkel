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
