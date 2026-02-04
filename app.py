from flask import Flask, render_template, request, redirect, url_for
from db import fetch_all, execute, get_db_connection, create_all_tables

app = Flask(__name__)
app.secret_key = "hnkl_secret_key"

# ✅ Run once when app starts (Flask 3 compatible)
with app.app_context():
    create_all_tables()


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        return redirect(url_for("material_cost"))
    return "Login Page OK"


@app.route("/material-cost")
def material_cost():
    materials_a = fetch_all("SELECT * FROM material_a_cost")
    materials_b = fetch_all("SELECT * FROM material_b_cost")
    return {
        "material_a": materials_a,
        "material_b": materials_b
    }


@app.route("/save_project", methods=["POST"])
def save_project():
    execute("""
        INSERT INTO parts_projects (internal_Project, vehicle_code, quotation_date)
        VALUES (%s, %s, %s)
    """, (
        request.form.get("internal_Project"),
        request.form.get("vehicle_code"),
        request.form.get("quotation_date")
    ))
    return "Saved"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
