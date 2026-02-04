from db import fetch_all, execute, get_db_connection, fetch_one, create_all_tables
from flask import Flask, render_template, redirect, url_for, request
from decimal import Decimal

app = Flask(__name__)
app.secret_key = "hnkl_secret_key"

# ✅ Run once when app starts (Flask 3 compatible)
with app.app_context():
    create_all_tables()


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # later: validate user from DB
        return redirect(url_for("material_cost"))
    return render_template("login.html")


@app.route("/material-cost", methods=["GET", "POST"])
def material_cost():

    # -----------------------------
    # READ SELECTIONS (GET + POST)
    # -----------------------------
    selected_id_mat_a = request.values.get("material_id_a")
    selected_id_mat_b = request.values.get("material_id_b")
    selected_id_mat_c = request.values.get("material_id_c")
    selected_machine_id = request.values.get("selected_machine")
    selected_labour_id = request.values.get("labour_id")

    # -----------------------------
    # MATERIAL PRICES
    # -----------------------------
    PRICES = {
        "Tracomb_PO_3142": Decimal("6.14"),
        "Tracomb_PO_3132": Decimal("7.28"),
        "Tracomb_PO_3170": Decimal("0"),
        "EVA_VS_430": Decimal("0"),
        "EVA_18002D": Decimal("0"),
        "EVA_Repsol_PA538": Decimal("1.57"),
        "Luvomaxx_LB_S": Decimal("14.35"),
        "Lotader_AX_8900": Decimal("5.30"),
        "Elvax_4260": Decimal("6.54"),
        "Evatane_2805": Decimal("2.61"),
        "Evatane_2825": Decimal("2.41"),
        "Irganox_1010": Decimal("6.80"),
        "Escorene_UL00728cc": Decimal("3.30"),
    }

    def d(name):
        return Decimal(request.form.get(name, "0") or "0")

    # -----------------------------
    # RECALCULATE (POST only)
    # -----------------------------
    if request.method == "POST" and request.form.get("action") == "recalc":
        price_actual = (
            d("Tracomb_PO_3142_percent")/100 * PRICES["Tracomb_PO_3142"]
            + d("Tracomb_PO_3132_percent")/100 * PRICES["Tracomb_PO_3132"]
            + d("Tracomb_PO_3170_percent")/100 * PRICES["Tracomb_PO_3170"]
            + d("EVA_VS_430_percent")/100 * PRICES["EVA_VS_430"]
            + d("EVA_18002D_percent")/100 * PRICES["EVA_18002D"]
            + d("EVA_Repsol_PA538_percent")/100 * PRICES["EVA_Repsol_PA538"]
            + d("Luvomaxx_LB_S_percent")/100 * PRICES["Luvomaxx_LB_S"]
            + d("Lotader_AX_8900_percent")/100 * PRICES["Lotader_AX_8900"]
            + d("Elvax_4260_percent")/100 * PRICES["Elvax_4260"]
            + d("Evatane_2805_percent")/100 * PRICES["Evatane_2805"]
            + d("Evatane_2825_percent")/100 * PRICES["Evatane_2825"]
            + d("Irganox_1010_percent")/100 * PRICES["Irganox_1010"]
            + d("Escorene_UL00728cc_percent") /
            100 * PRICES["Escorene_UL00728cc"]
        ).quantize(Decimal("0.0001"))

        execute("""
            UPDATE material_b_cost
            SET Price_per_kg_actual=%s
            WHERE id=%s
        """, (price_actual, selected_id_mat_b))

    # -----------------------------
    # LOAD DROPDOWNS (ALWAYS)
    # -----------------------------
    materials_a = fetch_all(
        "SELECT id, Material_A FROM material_a_cost ORDER BY Material_A")
    materials_b = fetch_all(
        "SELECT id, Material_B FROM material_b_cost ORDER BY Material_B")
    materials_c = fetch_all(
        "SELECT id, Material_C FROM material_c_cost ORDER BY Material_C")

    # -----------------------------
    # LOAD SELECTED ROWS
    # -----------------------------
    selected_row_mat_a = fetch_all(
        "SELECT * FROM material_a_cost WHERE id=%s", (selected_id_mat_a,)
    ) if selected_id_mat_a else []

    # for dropdown
    selected_row_mat_b = fetch_all(
        "SELECT * FROM material_b_cost WHERE id=%s", (selected_id_mat_b,)
    ) if selected_id_mat_b else []

    selected_row_mat_c = fetch_all(
        "SELECT * FROM material_c_cost WHERE id=%s", (selected_id_mat_c,)
    ) if selected_id_mat_c else []

    # -----------------------------
    # RENDER
    # -----------------------------
    return render_template(
        "materialCost.html",
        materials_a=materials_a,
        materials_b=materials_b,
        materials_c=materials_c,

        selected_row_mat_a=selected_row_mat_a,
        selected_row_mat_b=selected_row_mat_b,
        selected_row_mat_c=selected_row_mat_c,

        selected_id_mat_a=selected_id_mat_a,
        selected_id_mat_b=selected_id_mat_b,
        selected_id_mat_c=selected_id_mat_c,

        selected_machine_id=selected_machine_id,
        selected_labour_id=selected_labour_id
    )


@app.route('/machinery-cost')
def machinery_cost():
    selected_machine_id = request.args.get("selected_machine")
    # ========================================================
    # Machinery Cost
    # ========================================================

    machines = fetch_all("""
        SELECT id, machine_title
        FROM machinery_cost
        ORDER BY machine_title
    """)

    selected_machine_row = []
    if selected_machine_id:
        selected_machine_row = fetch_all(
            """
            SELECT machine_nr,
                   machine_title,
                   machine_rate_per_hour,
                   clamping_t,
                   manufacturer_type
            FROM machinery_cost
            WHERE id = %s
            """,
            (selected_machine_id,)
        )

    return render_template("machineryCost.html", machines=machines,
                           selected_machine_row=selected_machine_row,
                           selected_machine_id=selected_machine_id,)


@app.route('/labour-cost')
def Labour_cost():
    selected_labour_id = request.args.get("labour_id")

    # ========================================================
    # Labour Cost
    # ========================================================
    labours = fetch_all("""
        SELECT id, role_name
        FROM labour_cost
        ORDER BY role_name                    
    """)

    selected_labour_row = []
    if selected_labour_id:
        selected_labour_row = fetch_all(
            """SELECT role_name, unit, price_actual, price_old_1, price_old_2
                FROM labour_cost
                WHERE id = %s
            """, (selected_labour_id,)
        )

    return render_template("labourCost.html", labours=labours,
                           selected_labour_row=selected_labour_row,
                           selected_labour_id=selected_labour_id)


@app.route("/calculation-sheet")
def calculation_sheet():
    quotation_id = request.args.get("quotation_id")

    positions = []
    if quotation_id:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT id, pos_no FROM parts_positions WHERE quotation_id=%s ORDER BY pos_no",
            (quotation_id,)
        )
        positions = cur.fetchall()
        cur.close()
        conn.close()

    return render_template(
        "calculationSheet.html",
        quotation_id=quotation_id,
        positions=positions
    )


@app.route("/save_quotation", methods=["POST"])
def save_quotation():
    data = (
        request.form.get("internal_Project"),
        request.form.get("vehicle_code"),
        request.form.get("OEM_SOP"),
        request.form.get("henkel_PL"),
        request.form.get("quotation_date"),
        request.form.get("quotation_rev_level"),
        request.form.get("supplier"),
        request.form.get("supplier_contact"),
        request.form.get("LCUR_for_quotation"),
        request.form.get("LCUR_abbreviation")
    )

    # print("DATA : ", data)
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO parts_projects (
            internal_Project,
            vehicle_code,
            OEM_SOP,
            henkel_PL,
            quotation_date,
            quotation_rev_level,
            supplier,
            supplier_contact,
            LCUR_for_quotation,
            LCUR_abbreviation
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    cursor.execute(query, data)
    quotation_id = cursor.lastrowid   # ✅ IMPORTANT
    conn.commit()

    cursor.close()
    conn.close()
    return redirect(url_for("calculation_sheet", quotation_id=quotation_id))
    # return redirect(url_for("calculation_sheet"))

# =========================================================================


@app.route("/quotation/<int:quotation_id>/part-specs")
def part_specs(quotation_id):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        "SELECT id, pos_no FROM parts_positions WHERE quotation_id=%s ORDER BY pos_no",
        (quotation_id,)
    )
    positions = cur.fetchall()

    # Part concept master
    cur.execute("""
        SELECT id, partConceptName
        FROM part_concept
        ORDER BY partConceptName
    """)
    part_concepts = cur.fetchall()
    # print("part_concepts: ", part_concepts)

    # Design Concept Master
    cur.execute("""
        SELECT id, designConceptName
        FROM design_concept
        ORDER BY designConceptName
    """)
    design_concepts = cur.fetchall()
    # print("design_concepts: ", design_concepts)

    # Material A for section 1.2 dropdown
    materials_a = fetch_all("""
        SELECT id, Material_A, Density_kg_dm3, Price_per_kg_actual
        FROM material_a_cost
        ORDER BY Material_A
    """)
    # print("materials_a: ", materials_a)

    # Material B for section 1.2 dropdown
    materials_b = fetch_all("""
        SELECT id, Material_B, Density_kg_dm3, Price_per_kg_actual
        FROM material_b_cost
        ORDER BY Material_B
    """)
    # print("materials_b: ", materials_b)

    # Material C for section 1.2 dropdown
    materials_c = fetch_all("""
        SELECT id, Material_C, Density_kg_dm3
        FROM material_c_cost
        ORDER BY Material_C
    """)
    # print(materials_c)

    # Type of box section 1.3 dropdown
    type_of_box = fetch_all("""
        SELECT id, packaging_code, packaging_name, length_mm, width_mm, height_mm, weight_kg, volume_mm3
        FROM packaging
        ORDER BY packaging_code                      
    """)

    # Pallet Description [mm] section 1.3 dropdown
    pallet_description = fetch_all("""
        SELECT id, palette_code, palette_name, length_mm, width_mm, height_mm, weight_kg, volume_mm3
        FROM palettes
        ORDER BY palette_code                               
    """)

    # top (Deckel) Description section 1.3 dropdown
    top_description = fetch_all("""
        SELECT id, deckel_code, deckel_name, length_mm, width_mm, height_mm, weight_kg, volume_mm3
        FROM deckel
        ORDER BY deckel_code                            
    """)

    # ----------------------------------
    # 2.Tool Layout
    # ----------------------------------
    # Tool & Machine Nr.
    machines = fetch_all("""
        SELECT id, machine_nr, machine_title, machine_rate_per_hour
        FROM machinery_cost                     
    """)
    # print(machines)

    tools = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

    # ------------------------------------
    # 3. Part Cost
    # ------------------------------------
    # 3.1.3 LABOUR COST (1K / 2K / 1K+1K)
    Hourly_wage_machine_operator_price = fetch_all("""
        SELECT price_actual
        FROM labour_cost
        WHERE role_name = 'Hourly wage machine operator'
    """)

    labour_cost_per_hour = (
        float(Hourly_wage_machine_operator_price[0]["price_actual"])
        if Hourly_wage_machine_operator_price else 0
    )

    print("labour_cost_per_hour: ", labour_cost_per_hour)

    # Hourly wage setup operator
    Hourly_wage_setup_price = 0  # 👈 initialize first
    Hourly_wage_setup_operator = fetch_all("""
        SELECT price_actual
        FROM labour_cost
        WHERE role_name = 'Hourly wage setup operator'
    """)
    Hourly_wage_setup_price = (
        float(Hourly_wage_setup_operator[0]["price_actual"])
        if Hourly_wage_setup_operator else 0
    )
    print("Hourly_wage_setup_price: ", Hourly_wage_setup_price)

    # Hourly wage Assembly person
    assembly_cost_per_hour = 0
    Hourly_wage_Assembly_person = fetch_all("""
        SELECT price_actual
        FROM labour_cost
        WHERE role_name = 'Hourly wage Assembly person'
    """)
    assembly_cost_per_hour = (
        float(Hourly_wage_Assembly_person[0]["price_actual"])
        if Hourly_wage_Assembly_person else 0
    )
    print("assembly_cost_per_hour: ", assembly_cost_per_hour)

    cur.close()
    conn.close()
    return render_template(
        "calculationSheet.html",
        quotation_id=quotation_id,
        positions=positions,
        part_concepts=part_concepts,
        design_concepts=design_concepts,
        materials_a=materials_a,
        materials_b=materials_b,
        materials_c=materials_c,
        type_of_box=type_of_box,
        pallet_description=pallet_description,
        top_description=top_description,
        machines=machines,
        tools=tools,
        labour_cost_per_hour=labour_cost_per_hour,
        Hourly_wage_setup_price=Hourly_wage_setup_price,
        assembly_cost_per_hour=assembly_cost_per_hour
    )


@app.route("/generate_positions/<int:quotation_id>", methods=["POST"])
def generate_positions(quotation_id):
    pos_count = int(request.form["pos_count"])

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    # fetch existing positions
    cur.execute(
        """
        SELECT id, pos_no
        FROM parts_positions
        WHERE quotation_id = %s
        ORDER BY pos_no
        """,
        (quotation_id,)
    )
    existing_positions = cur.fetchall()
    existing_count = len(existing_positions)

    # ===============================
    # CASE 1: REDUCE positions
    # ===============================
    if pos_count < existing_count:
        positions_to_delete = existing_positions[pos_count:]

        pos_ids = [p["id"] for p in positions_to_delete]

        if pos_ids:
            placeholders = ",".join(["%s"] * len(pos_ids))

            # delete project details
            cur.execute(
                f"""
                DELETE FROM pos_project_details
                WHERE pos_id IN ({placeholders})
                """,
                pos_ids
            )

            # delete plant derivatives
            cur.execute(
                f"""
                DELETE FROM pos_plant_derivatives
                WHERE pos_id IN ({placeholders})
                """,
                pos_ids
            )

            # finally delete positions
            cur.execute(
                f"""
                DELETE FROM parts_positions
                WHERE id IN ({placeholders})
                """,
                pos_ids
            )

    # ===============================
    # CASE 2: INCREASE positions
    # ===============================
    elif pos_count > existing_count:
        for i in range(existing_count + 1, pos_count + 1):
            cur.execute(
                """
                INSERT INTO parts_positions (quotation_id, pos_no)
                VALUES (%s, %s)
                """,
                (quotation_id, i)
            )

    conn.commit()
    cur.close()
    conn.close()

    # return redirect(f"/quotation/{quotation_id}/part-specs")
    return redirect(url_for("part_specs", quotation_id=quotation_id, open="part"))


@app.route("/save_plant_derivatives/<int:quotation_id>", methods=["POST"])
def save_plant_derivatives(quotation_id):
    conn = get_db_connection()
    cur = conn.cursor()

    for key in request.form:
        if key.startswith("derivative_value"):
            pos_id, der_no = key.replace(
                "derivative_value[", "").replace("]", "").split("][")

            value = request.form.get(key, 0)
            selected = f"derivative_selected[{pos_id}][{der_no}]" in request.form

            cur.execute("""
                INSERT INTO pos_plant_derivatives
                (quotation_id, pos_id, derivative_no, avg_cars_per_year, is_selected)
                VALUES (%s,%s,%s,%s,%s)
                ON DUPLICATE KEY UPDATE
                    avg_cars_per_year=VALUES(avg_cars_per_year),
                    is_selected=VALUES(is_selected)
            """, (
                quotation_id,
                pos_id,
                der_no,
                value,
                selected
            ))

    conn.commit()
    cur.close()
    conn.close()

    return redirect(request.referrer)


def num(val):
    return val if val not in ("", None) else None


@app.route("/save_section_1/<int:quotation_id>", methods=["POST"])
def save_section_1(quotation_id):

    conn = get_db_connection()
    cur = conn.cursor()

    # Loop using Section 1.1 keys (POS driven)
    for key in request.form:
        if not key.startswith("section["):
            continue

        pos_id = key.split("[")[1].replace("]", "")

        # =====================================================
        # SECTION 1.1 → pos_project_details
        # =====================================================
        cur.execute("""
            INSERT INTO pos_project_details (
                quotation_id, pos_id,
                section,
                design_for_offer,
                customer_part_number,
                customer_part_name,
                idh_number,
                imds_number,
                design_level,
                part_concept,
                design_concept,
                clip_design,
                number_of_clips,
                gap_to_panel,
                design_features,
                lifetime_years,
                parts_per_car,
                parts_per_year,
                comments
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s
            )
        """, (
            quotation_id,
            pos_id,
            request.form.get(f"section[{pos_id}]"),
            request.form.get(f"design_for_offer[{pos_id}]"),
            num(request.form.get(f"customer_part_number[{pos_id}]")),
            request.form.get(f"customer_part_name[{pos_id}]"),
            request.form.get(f"idh_number[{pos_id}]"),
            request.form.get(f"imds_number[{pos_id}]"),
            num(request.form.get(f"design_level[{pos_id}]")),
            request.form.get(f"part_concept[{pos_id}]"),
            request.form.get(f"design_concept[{pos_id}]"),
            request.form.get(f"clip_design[{pos_id}]"),
            num(request.form.get(f"number_of_clips[{pos_id}]")),
            num(request.form.get(f"gap_to_panel[{pos_id}]")),
            request.form.get(f"design_features[{pos_id}]"),
            num(request.form.get(f"lifetime_years[{pos_id}]")),
            num(request.form.get(f"parts_per_car[{pos_id}]")),
            num(request.form.get(f"parts_per_year[{pos_id}]")),
            request.form.get(f"comments[{pos_id}]"),
        ))

        # ===================================================
        # SECTION 1.2 → quotation_section_1_2_weight
        # =====================================================

        cur.execute("""
            INSERT INTO quotation_section_1_2_weight (
                quotation_id, position_id,
                material_a, density_g_cm3_mat_a, volume_cm3_mat_a, weight_g_mat_a,
                material_b, density_g_cm3_mat_b, volume_cm3_mat_b, weight_g_mat_b,
                material_c, density_g_cm3_mat_c, volume_cm3_mat_c, weight_g_mat_c,
                material_d, weight_g_mat_d,
                total_weight_per_part_g,
                polyamide_weight_per_car,
                terophon_terocore_weight_per_car,
                steel_weight_per_car,
                other_mat_weight_per_car,
                total_weight_per_car_g
            ) VALUES (
                %s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,
                %s,%s,%s,%s,%s,%s
            )
        """, (
            quotation_id,
            pos_id,

            request.form.get(f"material_a[{pos_id}]"),
            num(request.form.get(f"density_mat_a[{pos_id}]")),
            num(request.form.get(f"volume_mat_a[{pos_id}]")),
            num(request.form.get(f"weight_mat_a[{pos_id}]")),

            request.form.get(f"material_b[{pos_id}]"),
            num(request.form.get(f"density_mat_b[{pos_id}]")),
            num(request.form.get(f"volume_mat_b[{pos_id}]")),
            num(request.form.get(f"weight_mat_b[{pos_id}]")),

            request.form.get(f"material_c[{pos_id}]"),
            # request.form.get(f"density_mat_c[{pos_id}]"),
            num(request.form.get(f"density_mat_c[{pos_id}]")),
            num(request.form.get(f"volume_mat_c[{pos_id}]")),
            num(request.form.get(f"weight_mat_c[{pos_id}]")),

            request.form.get(f"material_d[{pos_id}]"),
            num(request.form.get(f"weight_mat_d[{pos_id}]")),

            num(request.form.get(f"total_weight[{pos_id}]")),
            num(request.form.get(f"polyamide_weight_per_car[{pos_id}]")),
            num(request.form.get(
                f"terophon_terocore_weight_per_car[{pos_id}]")),
            num(request.form.get(f"steel_weight_per_car[{pos_id}]")),
            num(request.form.get(f"other_mat_weight_per_car[{pos_id}]")),
            num(request.form.get(f"total_weight_per_car[{pos_id}]")),
        ))

        # =====================================================
        # SECTION 1.3 → quotation_section_1_3_logistics Evaluation
        # =====================================================

        # Box Dimensions
        box_dimensions = request.form.get(
            f"box_dimensions[{pos_id}]", "").strip()
        print("box_dimensions: ", box_dimensions)

        # Split and convert to integers
        # box_length_mm, box_width_mm, box_height_mm = [
        #     int(x.strip()) for x in box_dimensions.lower().split("x")
        # ]

        if box_dimensions:
            try:
                parts = [p.strip()
                         for p in box_dimensions.lower().split("x") if p.strip()]
                if len(parts) == 3:
                    box_length_mm, box_width_mm, box_height_mm = map(
                        int, parts)
                else:
                    box_length_mm = box_width_mm = box_height_mm = None
            except ValueError:
                box_length_mm = box_width_mm = box_height_mm = None
        else:
            box_length_mm = box_width_mm = box_height_mm = None

        print(box_length_mm, box_width_mm, box_height_mm)

        # Type Of Box
        type_of_box_id = request.form.get(f"type_of_box[{pos_id}]")

        type_of_box = None

        if type_of_box_id:
            box = fetch_one("""
                SELECT packaging_code, packaging_name
                FROM packaging
                WHERE id = %s
            """, (type_of_box_id,))

            if box:
                type_of_box = f"{box['packaging_code']} {box['packaging_name']}"
        print("type_of_box", type_of_box)

        # Pallet Description
        pallet_description_id = request.form.get(
            f"pallet_description[{pos_id}]")

        pallet_description = None

        if pallet_description_id:
            pallet = fetch_one("""
                SELECT palette_code, palette_name
                FROM palettes
                WHERE id = %s                   
            """, (pallet_description_id,))

            if pallet:
                pallet_description = f"{pallet['palette_code']} {pallet['palette_name']}"

        print("pallet_description", pallet_description)

        # Top Description
        top_description_id = request.form.get(f"top_description[{pos_id}]")

        top_description = None

        if top_description_id:
            top_desc = fetch_one("""
                SELECT deckel_code, deckel_name
                FROM deckel
                WHERE id = %s                     
            """, (top_description_id,))

            if top_desc:
                top_description = f"{top_desc['deckel_code']} {top_desc['deckel_name']}"

        print("top_description", top_description)

        cur.execute("""
            INSERT INTO quotation_section_1_3_logistics(
                quotation_id, position_id,
                type_of_box, box_length_mm, box_width_mm, box_height_mm,
                box_weight_kg, box_volume_l, bulk_factor, parts_per_box_calc, parts_per_box_defined,weight_unit_red_limit, weight_per_unit_kg,
                pallet_description, top_description, boxes_per_pallet, parts_per_pallet, pallet_weight_gross_kg,
                parts_per_month, boxes_per_month, pallets_per_month,
                boxes_lot, pallets_lot, production_lot_parts, production_runs_per_year,
                pallets_min_order_qty, parts_min_order_qty
            ) VALUES(
                %s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,
                %s,%s,%s,
                %s,%s,%s,%s,
                %s,%s
            )
        """, (
            quotation_id,
            pos_id,
            type_of_box,
            box_length_mm, box_width_mm, box_height_mm,
            request.form.get(f"box_weight[{pos_id}]"),
            request.form.get(f"box_volume[{pos_id}]"),
            request.form.get(f"bulk_factor[{pos_id}]"),
            request.form.get(f"parts_per_box_calc[{pos_id}]"),
            request.form.get(f"parts_per_box_defined[{pos_id}]"),
            request.form.get(f"weight_unit_red_limit[{pos_id}]"),
            request.form.get(f"weight_per_unit_kg[{pos_id}]"),
            pallet_description,
            top_description,
            request.form.get(f"boxes_per_pallet[{pos_id}]"),
            request.form.get(f"parts_per_pallet[{pos_id}]"),
            request.form.get(f"pallet_weight_gross_kg[{pos_id}]"),
            request.form.get(f"parts_per_month[{pos_id}]"),
            request.form.get(f"boxes_per_month[{pos_id}]"),
            request.form.get(f"pallets_per_month[{pos_id}]"),
            request.form.get(f"boxes_lot[{pos_id}]"),
            request.form.get(f"pallets_lot[{pos_id}]"),
            request.form.get(f"production_lot_parts[{pos_id}]"),
            request.form.get(f"production_runs_per_year[{pos_id}]"),
            request.form.get(f"pallets_min_order_qty[{pos_id}]"),
            request.form.get(f"parts_min_order_qty[{pos_id}]")
        ))

        # =====================================================
        # SECTION 2 → Tool Layout & Tooling Cost
        # =====================================================

        materials = ["A", "B", "C"]

        # -----------------------------------------
        # 2.1 / 2.2 / 2.3 → Per material data
        # -----------------------------------------
        for mat in materials:
            cur.execute("""
                INSERT INTO quotation_section_2_tooling_material (
                    quotation_id,
                    position_id,
                    material_code,
    
                    projected_area_cm2,
                    min_clamping_force_t,
                    max_dimension_L,
                    max_dimension_B,
                    max_dimension_H,
    
                    tool_code,
                    machine_id,
                    machine_nr_value,
    
                    material_cost_prorated,
                    manufacturing_cost_prorated,
                    construction_cost_prorated,
                    service_overhead_cost_prorated,
    
                    mould_investment_prorated,
                    comments
                ) VALUES (
                    %s,%s,%s,
                    %s,%s,%s,%s,%s,
                    %s,%s,%s,
                    %s,%s,%s,%s,
                    %s,%s
                )
                ON DUPLICATE KEY UPDATE
                    projected_area_cm2 = VALUES(projected_area_cm2),
                    min_clamping_force_t = VALUES(min_clamping_force_t),
                    max_dimension_L = VALUES(max_dimension_L),
                    max_dimension_B = VALUES(max_dimension_B),
                    max_dimension_H = VALUES(max_dimension_H),
    
                    tool_code = VALUES(tool_code),
                    machine_id = VALUES(machine_id),
                    machine_nr_value = VALUES(machine_nr_value),
    
                    material_cost_prorated = VALUES(material_cost_prorated),
                    manufacturing_cost_prorated = VALUES(manufacturing_cost_prorated),
                    construction_cost_prorated = VALUES(construction_cost_prorated),
                    service_overhead_cost_prorated = VALUES(service_overhead_cost_prorated),
    
                    mould_investment_prorated = VALUES(mould_investment_prorated),
                    comments = VALUES(comments)
            """, (
                quotation_id,
                pos_id,
                mat,

                num(request.form.get(f"projected_area[{mat}][{pos_id}]")),
                num(request.form.get(
                    f"min_clamping_per_part[{mat}][{pos_id}]")),
                num(request.form.get(f"max_dim_l[{mat}][{pos_id}]")),
                num(request.form.get(f"max_dim_b[{mat}][{pos_id}]")),
                num(request.form.get(f"max_dim_h[{mat}][{pos_id}]")),

                request.form.get(f"tool_code[{mat}][{pos_id}]"),
                request.form.get(f"tool_machine[{mat}][{pos_id}]"),
                num(request.form.get(f"machine_nr_value[{mat}][{pos_id}]")),

                num(request.form.get(
                    f"material_{mat.lower()}_prorated[{mat}][{pos_id}]")),
                num(request.form.get(
                    f"manufacturing_{mat.lower()}_prorated[{mat}][{pos_id}]")),
                num(request.form.get(
                    f"construction_{mat.lower()}_prorated[{mat}][{pos_id}]")),
                num(request.form.get(
                    f"service_overhead_{mat.lower()}_prorated[{mat}][{pos_id}]")),

                num(request.form.get(
                    f"mould_investment_{mat.lower()}_prorated[{mat}][{pos_id}]")),
                request.form.get(
                    f"comments[CD][{pos_id}]") if mat == "C" else None
            ))

        # -----------------------------------------
        # 2.4 → TOTAL tooling cost (per position)
        # -----------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_2_tooling_totals (
                quotation_id,
                position_id,
                total_mould_investment_prorated,
                end_of_arm_tooling_cost_prorated,
                total_investment_prorated
            ) VALUES (
                %s,%s,%s,%s,%s
            )
            ON DUPLICATE KEY UPDATE
                total_mould_investment_prorated = VALUES(total_mould_investment_prorated),
                end_of_arm_tooling_cost_prorated = VALUES(end_of_arm_tooling_cost_prorated),
                total_investment_prorated = VALUES(total_investment_prorated)
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(f"total_mould_investment[{pos_id}]")),
            num(request.form.get(
                f"end_of_arm_tooling_or_gripper_cost[{pos_id}]")),
            num(request.form.get(f"total_investment[{pos_id}]"))
        ))

        # ----------------------------------------------
        # 3.1.1 MATERIAL COST
        # ----------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_1_1_component_a_material_cost(
                quotation_id, position_id, material_cost, indirect_cost_pct, total_cost
            )VALUES (
                %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                material_cost = VALUES(material_cost),
                indirect_cost_pct = VALUES(indirect_cost_pct),
                total_cost = VALUES(total_cost)
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(f"_3_1_1_material_a_cost[{pos_id}]")),
            num(request.form.get(
                f"_3_1_1_material_a_indirect_cost[{pos_id}]")),
            num(request.form.get(f"_3_1_1_material_a_total_cost[{pos_id}]"))
        ))

        # ------------------------------------------
        # 3.1.2 PRODUCTION COST (1K / 2K / 1K+1K)
        # ------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_1_2_component_a_production_cost(
                quotation_id, position_id, machine, tool_nr, production_runs_per_year, finished_parts_per_cycle_tool, finished_parts_per_cycle_part, startup_phaseout_time, cycle_time_sec, downtime_pct, waste_rate_pct, parts_per_production_lot, production_run_duration_hr, annual_machine_time_hr, shots_per_hour, machine_rate, production_indirect_cost_pct, production_cost_per_part
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                machine = VALUES(machine),                        
                tool_nr = VALUES(tool_nr),                        
                production_runs_per_year = VALUES(production_runs_per_year),                        
                finished_parts_per_cycle_tool = VALUES(finished_parts_per_cycle_tool),                        
                finished_parts_per_cycle_part = VALUES(finished_parts_per_cycle_part),                        
                startup_phaseout_time = VALUES(startup_phaseout_time),                        
                cycle_time_sec = VALUES(cycle_time_sec),                        
                downtime_pct = VALUES(downtime_pct),                        
                waste_rate_pct = VALUES(waste_rate_pct),                        
                parts_per_production_lot = VALUES(parts_per_production_lot),                        
                production_run_duration_hr = VALUES(production_run_duration_hr),                        
                annual_machine_time_hr = VALUES(annual_machine_time_hr),                        
                shots_per_hour = VALUES(shots_per_hour),                        
                machine_rate = VALUES(machine_rate),                        
                production_indirect_cost_pct = VALUES(production_indirect_cost_pct),                        
                production_cost_per_part = VALUES(production_cost_per_part)                        
        """, (
            quotation_id,
            pos_id,
            request.form.get(f"_3_1_2_machine[{pos_id}]"),
            request.form.get(f"_3_1_2_tool_nr[{pos_id}]"),
            num(request.form.get(
                f"_3_1_2_num_of_production_runs_per_year[{pos_id}]")),
            num(request.form.get(
                f"_3_1_2_num_of_finished_parts_per_cycle_tool[{pos_id}]")),
            num(request.form.get(
                f"_3_1_2_num_of_finished_parts_per_cycle_part_nr[{pos_id}]")),
            num(request.form.get(
                f"_3_1_2_startup_phaseout_time_per_production[{pos_id}]")),
            num(request.form.get(f"_3_1_2_cycle_time[{pos_id}]")),
            num(request.form.get(f"_3_1_2_downtime_breakdowns[{pos_id}]")),
            num(request.form.get(f"_3_1_2_total_waste_rate[{pos_id}]")),
            num(request.form.get(
                f"_3_1_2_num_of_parts_per_production_lot[{pos_id}]")),
            num(request.form.get(
                f"_3_1_2_duration_of_production_run[{pos_id}]")),
            num(request.form.get(f"_3_1_2_annual_machine_time[{pos_id}]")),
            num(request.form.get(f"_3_1_2_shots_per_hour[{pos_id}]")),
            num(request.form.get(f"_3_1_2_machine_rate[{pos_id}]")),
            num(request.form.get(
                f"_3_1_2_production_mat_a_indirect_cost[{pos_id}]")),
            num(request.form.get(f"_3_1_2_production_cost_per_part[{pos_id}]"))
        ))

        # ----------------------------------------
        # 3.1.3 LABOUR COST
        # ----------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_1_3_component_a_labour_cost(
                quotation_id, position_id, personnel_employment_pct, labour_cost, labour_setup_cost, labour_indirect_cost_pct, labour_cost_per_part                
            )VALUES(
                %s, %s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                personnel_employment_pct = VALUES(personnel_employment_pct),            
                labour_cost = VALUES(labour_cost),            
                labour_setup_cost = VALUES(labour_setup_cost),            
                labour_indirect_cost_pct = VALUES(labour_indirect_cost_pct),            
                labour_cost_per_part = VALUES(labour_cost_per_part)            
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(
                f"_3_1_3_personnel_employment_during_production[{pos_id}]")),
            num(request.form.get(f"_3_1_3_labour_cost[{pos_id}]")),
            num(request.form.get(f"_3_1_3_Labour_setup_cost[{pos_id}]")),
            num(request.form.get(f"_3_1_3_Labour_indirect_cost[{pos_id}]")),
            num(request.form.get(f"_3_1_3_Labour_cost_per_part[{pos_id}]"))
        ))

        # -------------------------------------------
        # 3.2.1 MATERIAL COST (1K / 2K / 1K+1K)
        # -------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_2_1_component_b_material_cost(
                quotation_id, position_id, material_cost, indirect_cost_pct, total_cost                
            )VALUES(
                %s, %s, %s, %s, %s                
            )
            ON DUPLICATE KEY UPDATE
                material_cost = VALUES(material_cost),                    
                indirect_cost_pct = VALUES(indirect_cost_pct),                    
                total_cost = VALUES(total_cost)                    
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(f"_3_2_1_material_b_cost[{pos_id}]")),
            num(request.form.get(
                f"_3_2_1_material_b_indirect_cost[{pos_id}]")),
            num(request.form.get(f"_3_2_1_material_b_total_cost[{pos_id}]")),
        ))

        # -------------------------------------------
        # 3.2.2 PRODUCTION COST (1K)
        # -------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_2_2_component_b_production_cost(
                quotation_id, position_id, machine, tool_nr, production_runs_per_year, finished_parts_per_cycle_tool, finished_parts_per_cycle_part, startup_phaseout_time, cycle_time_sec, downtime_pct, waste_rate_pct, parts_per_production_lot, production_run_duration_hr, annual_machine_time_hr, shots_per_hour, machine_rate, production_indirect_cost_pct, production_cost_per_part
            )VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                machine = VALUES(machine),                        
                tool_nr = VALUES(tool_nr),                        
                production_runs_per_year = VALUES(production_runs_per_year),                        
                finished_parts_per_cycle_tool = VALUES(finished_parts_per_cycle_tool),                        
                finished_parts_per_cycle_part = VALUES(finished_parts_per_cycle_part),                        
                startup_phaseout_time = VALUES(startup_phaseout_time),                        
                cycle_time_sec = VALUES(cycle_time_sec),                        
                downtime_pct = VALUES(downtime_pct),                        
                waste_rate_pct = VALUES(waste_rate_pct),                        
                parts_per_production_lot = VALUES(parts_per_production_lot),                        
                production_run_duration_hr = VALUES(production_run_duration_hr),                        
                annual_machine_time_hr = VALUES(annual_machine_time_hr),                        
                shots_per_hour = VALUES(shots_per_hour),                        
                machine_rate = VALUES(machine_rate),                        
                production_indirect_cost_pct = VALUES(production_indirect_cost_pct),                        
                production_cost_per_part = VALUES(production_cost_per_part)            
        """, (
            quotation_id,
            pos_id,
            request.form.get(f"_3_2_2_machine[{pos_id}]"),
            request.form.get(f"_3_2_2_tool_nr[{pos_id}]"),
            num(request.form.get(
                f"_3_2_2_num_of_production_runs_per_year[{pos_id}]")),
            num(request.form.get(
                f"_3_2_2_num_of_finished_parts_per_cycle_tool[{pos_id}]")),
            num(request.form.get(
                f"_3_2_2_num_of_finished_parts_per_cycle_part_nr[{pos_id}]")),
            num(request.form.get(
                f"_3_2_2_startup_phaseout_time_per_production[{pos_id}]")),
            num(request.form.get(f"_3_2_2_cycle_time[{pos_id}]")),
            num(request.form.get(f"_3_2_2_downtime_breakdowns[{pos_id}]")),
            num(request.form.get(f"_3_2_2_total_waste_rate[{pos_id}]")),
            num(request.form.get(
                f"_3_2_2_num_of_parts_per_production_lot[{pos_id}]")),
            num(request.form.get(
                f"_3_2_2_duration_of_production_run[{pos_id}]")),
            num(request.form.get(f"_3_2_2_annual_machine_time[{pos_id}]")),
            num(request.form.get(f"_3_2_2_shots_per_hour[{pos_id}]")),
            num(request.form.get(f"_3_2_2_machine_rate[{pos_id}]")),
            num(request.form.get(
                f"_3_2_2_production_mat_b_indirect_cost[{pos_id}]")),
            num(request.form.get(f"_3_2_2_production_cost_per_part[{pos_id}]"))
        ))

        # -------------------------------------------
        # 3.2.3 LABOUR COST
        # -------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_2_3_component_b_labour_cost(
                quotation_id, position_id, personnel_employment_pct, labour_cost, labour_setup_cost, labour_indirect_cost_pct, labour_cost_per_part
            )VALUES(
                %s, %s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                personnel_employment_pct = VALUES(personnel_employment_pct),            
                labour_cost = VALUES(labour_cost),            
                labour_setup_cost = VALUES(labour_setup_cost),            
                labour_indirect_cost_pct = VALUES(labour_indirect_cost_pct),            
                personnel_employment_pct = VALUES(labour_cost_per_part)         
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(
                f"_3_2_3_personnel_employment_during_production[{pos_id}]")),
            num(request.form.get(f"_3_2_3_labour_cost[{pos_id}]")),
            num(request.form.get(f"_3_2_3_Labour_setup_cost[{pos_id}]")),
            num(request.form.get(f"_3_2_3_Labour_indirect_cost[{pos_id}]")),
            num(request.form.get(f"_3_2_3_Labour_cost_per_part[{pos_id}]"))

        ))

        # ------------------------------------------------
        # 3.3 Tooling Cost - maintenance / amortization
        # -----------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_3_tooling_cost(
                quotation_id, position_id, mould_maintenance_cost_pct, mould_amortization_over_part_costs, annual_interest_rate_pct, amortization_period_year, tooling_cost_per_part
            ) VALUES(
                %s, %s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                mould_maintenance_cost_pct = VALUES(mould_maintenance_cost_pct),
                mould_amortization_over_part_costs = VALUES(mould_amortization_over_part_costs),
                annual_interest_rate_pct = VALUES(annual_interest_rate_pct),
                amortization_period_year = VALUES(amortization_period_year),                    
                tooling_cost_per_part = VALUES(tooling_cost_per_part)                    
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(f"_3_3_mould_maintenance_cost[{pos_id}]")),
            request.form.get(
                f"_3_3_mould_amortization_over_part_cost[{pos_id}]"),
            num(request.form.get(f"_3_3_annual_interest_rate[{pos_id}]")),
            num(request.form.get(f"_3_3_amortization_period[{pos_id}]")),
            num(request.form.get(f"_3_3_tooling_cost_per_part[{pos_id}]"))
        ))

        # -----------------------------------------------
        # 3.4 Purchased components (Pins, Clips, Metal)
        # -----------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_4_purchased_components(
                quotation_id, position_id, material_c, material_c_indirect_cost, material_c_cost, material_d, material_d_indirect_cost, material_d_cost, purchased_components_cost
            )VALUES(
                %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                 material_c = VALUES(material_c),       
                 material_c_indirect_cost = VALUES(material_c_indirect_cost),       
                 material_c_cost = VALUES(material_c_cost),
                 material_d = VALUES(material_d),       
                 material_d_indirect_cost = VALUES(material_d_indirect_cost),       
                 material_d_cost = VALUES(material_d_cost),
                 purchased_components_cost = VALUES(purchased_components_cost)       
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(f"_3_4_material_c[{pos_id}]")),
            num(request.form.get(f"_3_4_material_c_indirect_cost[{pos_id}]")),
            num(request.form.get(f"_3_4_material_c_cost[{pos_id}]")),
            num(request.form.get(f"_3_4_material_d[{pos_id}]")),
            num(request.form.get(f"_3_4_material_d_indirect_cost[{pos_id}]")),
            num(request.form.get(f"_3_4_material_d_cost[{pos_id}]")),
            num(request.form.get(f"_3_4_purchased_components_cost[{pos_id}]"))
        ))

        # ------------------------------------------------
        # 3.5 Additional Costs
        # ------------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_5_additional_costs(
                quotation_id, position_id, assembly_time_s, assembly_cost_per_part_eur, quality_control_cost_per_part_eur
            )VALUES(
                %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                assembly_time_s = VALUES(assembly_time_s),
                assembly_cost_per_part_eur = VALUES(assembly_cost_per_part_eur),
                quality_control_cost_per_part_eur = VALUES(quality_control_cost_per_part_eur)
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(f"_3_5_1_assembly_time[{pos_id}]")),
            num(request.form.get(f"_3_5_1_assembly_cost_per_part[{pos_id}]")),
            num(request.form.get(
                f"_3_5_2_quality_control_cost_per_part[{pos_id}]"))
        ))

        # --------------------------------------------------
        # 3.6 Logistic calculation
        # --------------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_6_logistic_calculation(
                quotation_id, position_id, packaging_fix_cost_per_part_eur, turnaround_time_days, rent_per_box_per_day_eur, rent_per_pallet_per_day_eur, rent_per_top_per_day_eur, total_rent_per_packaging_unit_per_day_eur, total_rent_per_packaging_unit_per_turnaround_eur, total_rent_per_turnaround_per_part_eur, cardborad_inlays_per_box_eur, cardborad_inlays_per_part_eur, PE_bag_per_box_eur, PE_bag_per_part_eur, setting_time_per_part_s, setting_cost_per_part_eur, administration_cost_per_box_label_eur, administration_cost_per_pallet_comminsion_eur, administration_cost_per_delivery_paper_work_eur, admin_cost_per_part_eur, total_packaging_cost_A_price, transport_cost_per_pallet_eur, transport_cost_per_part_B_price_eur
            ) VALUES(
                %s, %s, %s, %s, %s,%s, %s, %s, %s, %s,%s, %s, %s, %s, %s,%s, %s, %s, %s, %s,%s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                packaging_fix_cost_per_part_eur = VALUES (packaging_fix_cost_per_part_eur),                
                turnaround_time_days = VALUES (turnaround_time_days),                
                rent_per_box_per_day_eur = VALUES (rent_per_box_per_day_eur),                
                rent_per_pallet_per_day_eur = VALUES (rent_per_pallet_per_day_eur),                
                rent_per_top_per_day_eur = VALUES (rent_per_top_per_day_eur),                
                total_rent_per_packaging_unit_per_day_eur = VALUES (total_rent_per_packaging_unit_per_day_eur),                
                total_rent_per_packaging_unit_per_turnaround_eur = VALUES (total_rent_per_packaging_unit_per_turnaround_eur),                
                total_rent_per_turnaround_per_part_eur = VALUES (total_rent_per_turnaround_per_part_eur),                
                cardborad_inlays_per_box_eur = VALUES (cardborad_inlays_per_box_eur),                
                cardborad_inlays_per_part_eur = VALUES (cardborad_inlays_per_part_eur),                
                PE_bag_per_box_eur = VALUES (PE_bag_per_box_eur),                
                PE_bag_per_part_eur = VALUES (PE_bag_per_part_eur),                
                setting_time_per_part_s = VALUES (setting_time_per_part_s),                
                setting_cost_per_part_eur = VALUES (setting_cost_per_part_eur),                
                administration_cost_per_box_label_eur = VALUES (administration_cost_per_box_label_eur),                
                administration_cost_per_pallet_comminsion_eur = VALUES (administration_cost_per_pallet_comminsion_eur),                
                administration_cost_per_delivery_paper_work_eur = VALUES (administration_cost_per_delivery_paper_work_eur),                
                admin_cost_per_part_eur = VALUES (admin_cost_per_part_eur),                
                total_packaging_cost_A_price = VALUES (total_packaging_cost_A_price),                
                transport_cost_per_pallet_eur = VALUES (transport_cost_per_pallet_eur),                
                transport_cost_per_part_B_price_eur = VALUES (transport_cost_per_part_B_price_eur)                
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(
                f"_3_6_1_1_packaging_fix_cost_per_part[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_turnaround_time[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_rent_box_day[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_rent_pallet_day[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_rent_top_day[{pos_id}]")),
            num(request.form.get(
                f"_3_6_1_2_total_rent_packaging_unit_day[{pos_id}]")),
            num(request.form.get(
                f"_3_6_1_2_total_rent_packaging_unit_turnaround[{pos_id}]")),
            num(request.form.get(
                f"_3_6_1_2_total_rent_turnaround_part[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_cardborad_inlays_box[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_cardborad_inlays_part[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_pe_bag_box[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_pe_bag_part[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_setting_time_part[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_setting_cost_part[{pos_id}]")),
            num(request.form.get(
                f"_3_6_1_2_administration_cost_box_label[{pos_id}]")),
            num(request.form.get(
                f"_3_6_1_2_administration_cost_pallet_commision[{pos_id}]")),
            num(request.form.get(
                f"_3_6_1_2_administration_cost_delivery_paper_work[{pos_id}]")),
            num(request.form.get(f"_3_6_1_2_admin_cost_part[{pos_id}]")),
            num(request.form.get(
                f"_3_6_1_2_total_packaging_cost_a_price[{pos_id}]")),
            num(request.form.get(f"_3_6_2_transport_cost_pallet[{pos_id}]")),
            num(request.form.get(
                f"_3_6_2_transport_cost_part_b_price[{pos_id}]"))
        ))

        # -------------------------------------------------
        # 3.7 Cost split
        # -------------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_7_cost_split(
               quotation_id, position_id, material_a, material_b, machine_a_b, labour_a_b, tooling_a_b, purchased_components, assembly, quality, logistic_packaging, handling_repacking_costs, manufactured_cost, toller_markup_profit, total_production_cost_part, one_gsc_markup_mu1, responsibility_price_per_part, responsibility_price_per_car, mould_cost_prorated_per_part_nr, cost_composition, comments
            )VALUES(
                %s, %s, %s, %s, %s,%s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
            material_a = VALUES(material_a),
            material_b = VALUES(material_b),
            machine_a_b = VALUES(machine_a_b),
            labour_a_b = VALUES(labour_a_b),
            tooling_a_b = VALUES(tooling_a_b),
            purchased_components = VALUES(purchased_components),
            assembly = VALUES(assembly),
            quality = VALUES(quality),
            logistic_packaging = VALUES(logistic_packaging),
            handling_repacking_costs = VALUES(handling_repacking_costs),
            manufactured_cost = VALUES(manufactured_cost),
            toller_markup_profit = VALUES(toller_markup_profit),
            total_production_cost_part = VALUES(total_production_cost_part),
            one_gsc_markup_mu1 = VALUES(one_gsc_markup_mu1),
            responsibility_price_per_part = VALUES(responsibility_price_per_part),
            responsibility_price_per_car = VALUES(responsibility_price_per_car),
            mould_cost_prorated_per_part_nr = VALUES(mould_cost_prorated_per_part_nr),
            cost_composition = VALUES(cost_composition),
            comments = VALUES(comments)
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(f"_3_7_1_material_a[{pos_id}]")),
            num(request.form.get(f"_3_7_1_material_b[{pos_id}]")),
            num(request.form.get(f"_3_7_1_machine_a_b[{pos_id}]")),
            num(request.form.get(f"_3_7_1_Labour_a_b[{pos_id}]")),
            num(request.form.get(f"_3_7_1_tooling_a_b[{pos_id}]")),
            num(request.form.get(f"_3_7_1_purchased_components[{pos_id}]")),
            num(request.form.get(f"_3_7_1_assembly[{pos_id}]")),
            num(request.form.get(f"_3_7_1_quality[{pos_id}]")),
            num(request.form.get(f"_3_7_1_logistic_packaging[{pos_id}]")),
            num(request.form.get(f"_3_7_1_handling_repacking[{pos_id}]")),
            num(request.form.get(f"_3_7_1_manufactured_cost[{pos_id}]")),
            num(request.form.get(f"_3_7_1_toller_markup_profit[{pos_id}]")),
            num(request.form.get(
                f"_3_7_1_total_production_cost_part[{pos_id}]")),
            num(request.form.get(f"_3_7_1_one_gsc_mark_up_mu1[{pos_id}]")),
            num(request.form.get(
                f"_3_7_1_responsibility_price_part[{pos_id}]")),
            num(request.form.get(
                f"_3_7_1_responsibility_price_car[{pos_id}]")),
            num(request.form.get(f"_3_7_1_mould_cost[{pos_id}]")),
            num(request.form.get(f"_3_7_1_cost_composition[{pos_id}]")),
            num(request.form.get(f"_3_7_1_comments[{pos_id}]"))
        ))

        # -------------------------------------------------
        # 3.8 Machine capacity & Tonnage/year
        # -------------------------------------------------
        #
        # -------------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_8_1_tonnage_per_year(
               quotation_id, position_id, material_a_eur_kg, material_b_eur_kg, material_c_kg, material_d_kg
            )VALUES(
                %s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
            material_a_eur_kg = VALUES(material_a_eur_kg),
            material_b_eur_kg = VALUES(material_b_eur_kg),
            material_c_kg = VALUES(material_c_kg),
            material_d_kg = VALUES(material_d_kg)            
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(f"_3_8_1_material_a[{pos_id}]")),
            num(request.form.get(f"_3_8_1_material_b[{pos_id}]")),
            num(request.form.get(f"_3_8_1_material_c[{pos_id}]")),
            num(request.form.get(f"_3_8_1_material_d[{pos_id}]"))
        ))

        # -------------------------------------------------
        # 3.8.2.1 Machine capacity - Material A
        # -------------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_8_2_1_machine_capacity_material_a(
               quotation_id, position_id, production_days_per_year, number_of_shifts_per_day, number_of_hours_per_shift, maximum_allowed_utilization_perc, productive_hours_per_year_h, annual_machine_time_per_part_number_h, machine_utilization_perc, number_of_machines_required
            )VALUES(
                %s, %s, %s, %s, %s,%s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
            production_days_per_year = VALUES(production_days_per_year),
            number_of_shifts_per_day = VALUES(number_of_shifts_per_day),
            number_of_hours_per_shift = VALUES(number_of_hours_per_shift),
            maximum_allowed_utilization_perc = VALUES(maximum_allowed_utilization_perc),            
            productive_hours_per_year_h = VALUES(productive_hours_per_year_h), 
            annual_machine_time_per_part_number_h = VALUES(annual_machine_time_per_part_number_h),            
            machine_utilization_perc = VALUES(machine_utilization_perc),
            number_of_machines_required = VALUES(number_of_machines_required)            
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(
                f"_3_8_2_1_production_days_per_year[{pos_id}]")),
            num(request.form.get(
                f"_3_8_2_1_number_of_shifts_per_day[{pos_id}]")),
            num(request.form.get(
                f"_3_8_2_1_number_of_hour_per_shift[{pos_id}]")),
            num(request.form.get(
                f"_3_8_2_1_maximum_allowed_utilization_extent[{pos_id}]")),
            num(request.form.get(
                f"_3_8_2_1_productive_hours_per_year[{pos_id}]")),
            num(request.form.get(f"_3_8_2_1_annual_machine_time[{pos_id}]")),
            num(request.form.get(f"_3_8_2_1_machine_utilization[{pos_id}]")),
            num(request.form.get(f"_3_8_2_1_no_of_machines_req[{pos_id}]"))
        ))

        # -------------------------------------------------
        # 3.8.2.2 Machine capacity - Material B
        # -------------------------------------------------
        cur.execute("""
            INSERT INTO quotation_section_3_8_2_2_machine_capacity_material_b(
               quotation_id, position_id, production_days_per_year, number_of_shifts_per_day, number_of_hours_per_shift, maximum_allowed_utilization_perc, productive_hours_per_year_h, annual_machine_time_per_part_number_h, machine_utilization_perc, number_of_machines_required
            )VALUES(
                %s, %s, %s, %s, %s,%s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
            production_days_per_year = VALUES(production_days_per_year),
            number_of_shifts_per_day = VALUES(number_of_shifts_per_day),
            number_of_hours_per_shift = VALUES(number_of_hours_per_shift),
            maximum_allowed_utilization_perc = VALUES(maximum_allowed_utilization_perc),            
            productive_hours_per_year_h = VALUES(productive_hours_per_year_h), 
            annual_machine_time_per_part_number_h = VALUES(annual_machine_time_per_part_number_h),            
            machine_utilization_perc = VALUES(machine_utilization_perc),
            number_of_machines_required = VALUES(number_of_machines_required)            
        """, (
            quotation_id,
            pos_id,
            num(request.form.get(
                f"_3_8_2_2_production_days_per_year[{pos_id}]")),
            num(request.form.get(
                f"_3_8_2_2_number_of_shifts_per_day[{pos_id}]")),
            num(request.form.get(
                f"_3_8_2_2_number_of_hour_per_shift[{pos_id}]")),
            num(request.form.get(
                f"_3_8_2_2_maximum_allowed_utilization_extent[{pos_id}]")),
            num(request.form.get(
                f"_3_8_2_2_productive_hours_per_year[{pos_id}]")),
            num(request.form.get(f"_3_8_2_2_annual_machine_time[{pos_id}]")),
            num(request.form.get(f"_3_8_2_2_machine_utilization[{pos_id}]")),
            num(request.form.get(f"_3_8_2_2_no_of_machines_req[{pos_id}]"))
        ))

    conn.commit()
    cur.close()
    conn.close()

    return redirect(request.referrer)


if __name__ == "__main__":
    app.run(debug=True)
