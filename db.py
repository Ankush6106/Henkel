# db.py
import mysql.connector
from mysql.connector import Error

# ---------------- Database Connection ----------------
DB_NAME = "hnkl_db"


def get_db_connection():
    try:
        # 1️⃣ Connect without database
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root123",
            use_pure=True
        )

        cursor = conn.cursor()

        # 2️⃣ Create database if not exists
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")

        # 3️⃣ Close initial connection
        cursor.close()
        conn.close()

        # 4️⃣ Reconnect using the database
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root123",
            database=DB_NAME,
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
            print("Query executed successfully")
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


def create_material_C_Cost_table():
    query = """
    CREATE TABLE IF NOT EXISTS material_C_Cost (
        id INT AUTO_INCREMENT PRIMARY KEY,

        Material_C VARCHAR(450),
        Density_kg_dm3 VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_machinery_Cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS machinery_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,

            machine_nr INT NOT NULL,
            machine_title VARCHAR(300),

            machine_rate_per_hour DECIMAL(10,2),
            clamping_t DECIMAL(6,0),

            manufacturer_type VARCHAR(255)

        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_labour_cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS labour_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,

            role_name VARCHAR(200) NOT NULL,
            unit VARCHAR(20) DEFAULT 'EUR/h',

            price_actual DECIMAL(8,2),
            price_old_1 DECIMAL(8,2),
            price_old_2 DECIMAL(8,2)

        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_packaging_table():
    query = """
        CREATE TABLE IF NOT EXISTS packaging (
        id INT AUTO_INCREMENT PRIMARY KEY,

        packaging_code VARCHAR(50),
        packaging_name VARCHAR(255),

        length_mm INT,
        width_mm INT,
        height_mm INT,

        weight_kg DECIMAL(6,2),
        volume_mm3 DECIMAL(8,2)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_palette_table():
    query = """
        CREATE TABLE IF NOT EXISTS palettes (
        id INT AUTO_INCREMENT PRIMARY KEY,

        palette_code VARCHAR(50),
        palette_name VARCHAR(255),

        length_mm INT,
        width_mm INT,
        height_mm INT,

        weight_kg DECIMAL(6,2),
        volume_mm3 DECIMAL(8,2)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


# def create_parts_project_table():
    query = """
        CREATE TABLE IF NOT EXISTS parts_projects(
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
        LCUR_abbreviation VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_parts_project_table():
    query = """
        CREATE TABLE IF NOT EXISTS parts_projects(
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


def create_part_concept_table():
    query = """
        CREATE TABLE IF NOT EXISTS part_concept(
        id INT AUTO_INCREMENT PRIMARY KEY,
        partConceptName VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_design_concept_table():
    query = """
        CREATE TABLE IF NOT EXISTS design_concept(
        id INT AUTO_INCREMENT PRIMARY KEY,
        designConceptName VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_parts_positions_table():
    query = """
        CREATE TABLE IF NOT EXISTS parts_positions (
            id INT AUTO_INCREMENT PRIMARY KEY,

            quotation_id INT NOT NULL,
            pos_no INT NOT NULL,          -- 1,2,3,...100

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE (quotation_id, pos_no),
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE
        );
    """
    execute_query(query)


def create_quotation_section_1_1_pos_project_details_table():
    query = """
        CREATE TABLE IF NOT EXISTS pos_project_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
    
        quotation_id INT NOT NULL,
        pos_id INT NOT NULL,
    
        section VARCHAR(255),
        design_for_offer VARCHAR(255),
    
        customer_part_number VARCHAR(255),
        customer_part_name VARCHAR(255),
    
        idh_number VARCHAR(255),
        imds_number INT,
    
        design_level VARCHAR(50),
        part_concept VARCHAR(100),
        design_concept VARCHAR(255),
        clip_design INT,
    
        number_of_clips INT,
        gap_to_panel VARCHAR(50),
    
        design_features TEXT,
        lifetime_years INT,
    
        parts_per_car INT,
        parts_per_year INT,
    
        comments TEXT,
    
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
        FOREIGN KEY (quotation_id)
            REFERENCES parts_projects(id)
            ON DELETE CASCADE,
    
        FOREIGN KEY (pos_id)
            REFERENCES parts_positions(id)
            ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_pos_plant_derivatives_table():
    query = """
        CREATE TABLE IF NOT EXISTS pos_plant_derivatives (
        id INT AUTO_INCREMENT PRIMARY KEY,
    
        quotation_id INT NOT NULL,
        pos_id INT NOT NULL,
    
        derivative_no INT NOT NULL,      -- 1..8
        avg_cars_per_year INT DEFAULT 0,
        is_selected BOOLEAN DEFAULT FALSE,
    
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
        UNIQUE (quotation_id, pos_id, derivative_no),
    
        FOREIGN KEY (quotation_id)
            REFERENCES parts_projects(id)
            ON DELETE CASCADE,
    
        FOREIGN KEY (pos_id)
            REFERENCES parts_positions(id)
            ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_quotation_section_1_2_weight_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_1_2_weight (
            id INT AUTO_INCREMENT PRIMARY KEY,

            quotation_id INT NOT NULL,
            position_id INT NOT NULL,

            material_a VARCHAR(250),
            density_g_cm3_mat_a DECIMAL(10,5),
            volume_cm3_mat_a DECIMAL(10,3),
            weight_g_mat_a DECIMAL(10,3),
            
            material_b VARCHAR(250),
            density_g_cm3_mat_b DECIMAL(10,5),
            volume_cm3_mat_b DECIMAL(10,3),
            weight_g_mat_b DECIMAL(10,3),
            
            material_c VARCHAR(250),
            density_g_cm3_mat_c DECIMAL(10,5),
            volume_cm3_mat_c DECIMAL(10,3),
            weight_g_mat_c DECIMAL(10,3),
            
            material_d VARCHAR(250),
            weight_g_mat_d DECIMAL(10,3),

			total_weight_per_part_g DECIMAL(10,3),
            
            polyamide_weight_per_car DECIMAL(10,3),
			terophon_terocore_weight_per_car DECIMAL(10,3),
            steel_weight_per_car DECIMAL(10,3),
            other_mat_weight_per_car DECIMAL(10,3),
            
			total_weight_per_car_g DECIMAL(10,3),
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,

            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_quotation_section_1_3_logistics_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_1_3_logistics (
        id INT AUTO_INCREMENT PRIMARY KEY,

        quotation_id INT NOT NULL,
        position_id INT NOT NULL,

        -- Packaging concept
        type_of_box VARCHAR(255),
        box_length_mm DECIMAL(10,2),
        box_width_mm DECIMAL(10,2),
        box_height_mm DECIMAL(10,2),

        box_weight_kg DECIMAL(10,3),
        box_volume_l DECIMAL(10,3),
        bulk_factor DECIMAL(10,3),

        parts_per_box_calc INT,
        parts_per_box_defined INT,

        weight_unit_red_limit DECIMAL(10,2),
        weight_per_unit_kg DECIMAL(10,3),

        -- Pallet
        pallet_description VARCHAR(255),
        top_description VARCHAR(255),

        boxes_per_pallet INT,
        parts_per_pallet INT,
        pallet_weight_gross_kg DECIMAL(10,3),

        -- Monthly
        parts_per_month INT,
        boxes_per_month INT,
        pallets_per_month INT,

        -- Lot production
        boxes_lot INT,
        pallets_lot INT,
        production_lot_parts INT,
        production_runs_per_year INT,

        pallets_min_order_qty INT,
        parts_min_order_qty INT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE (quotation_id, position_id),
        FOREIGN KEY (quotation_id) REFERENCES parts_projects(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_deckel_table():
    query = """
        CREATE TABLE IF NOT EXISTS deckel (
        id INT AUTO_INCREMENT PRIMARY KEY,

        deckel_code VARCHAR(50),
        deckel_name VARCHAR(255),

        length_mm INT,
        width_mm INT,
        height_mm INT,

        weight_kg DECIMAL(6,2),
        volume_mm3 DECIMAL(8,2)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_2_tooling_material_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_2_tooling_material (
            id INT AUTO_INCREMENT PRIMARY KEY,

            quotation_id INT NOT NULL,
            position_id INT NOT NULL,

            material_code CHAR(1) NOT NULL,  -- A / B / C / D

            -- Tool layout
            projected_area_cm2 DECIMAL(10,3),
            min_clamping_force_t DECIMAL(10,3),
            max_dimension_L INT,
            max_dimension_B INT,
            max_dimension_H INT,

            tool_code VARCHAR(20),
            machine_id INT,
            machine_nr_value DECIMAL(10,2),

            -- Tooling cost (prorated per part nr.)
            material_cost_prorated DECIMAL(12,4),
            manufacturing_cost_prorated DECIMAL(12,4),
            construction_cost_prorated DECIMAL(12,4),
            service_overhead_cost_prorated DECIMAL(12,4),

            mould_investment_prorated DECIMAL(14,4),

            comments VARCHAR(100),
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE (quotation_id, position_id, material_code),

            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,

            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE,

            FOREIGN KEY (machine_id)
                REFERENCES machinery_cost(id)
                ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_quotation_section_2_tooling_totals_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_2_tooling_totals (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
        
            total_mould_investment_prorated DECIMAL(14,4),
            end_of_arm_tooling_cost_prorated DECIMAL(14,4),
            total_investment_prorated DECIMAL(14,4),
        
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    execute_query(query)


def create_quotation_section_3_1_1_component_a_material_cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_1_1_component_a_material_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            material_cost DECIMAL(12,6) DEFAULT 0,
            indirect_cost_pct DECIMAL(6,3) DEFAULT 0,
            total_cost DECIMAL(12,6) DEFAULT 0,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_1_2_component_a_production_cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_1_2_component_a_production_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            machine VARCHAR(255),
            tool_nr VARCHAR(10),
            
            production_runs_per_year INT DEFAULT 0,
            finished_parts_per_cycle_tool INT DEFAULT 0,
            finished_parts_per_cycle_part INT DEFAULT 0,

            startup_phaseout_time DECIMAL(10,4) DEFAULT 0,
            cycle_time_sec DECIMAL(10,4) DEFAULT 0,
            downtime_pct DECIMAL(6,3) DEFAULT 0,
            waste_rate_pct DECIMAL(6,3) DEFAULT 0,

            parts_per_production_lot INT DEFAULT 0,
            production_run_duration_hr DECIMAL(12,4) DEFAULT 0,
            annual_machine_time_hr DECIMAL(12,4) DEFAULT 0,
            shots_per_hour DECIMAL(12,4) DEFAULT 0,
            machine_rate DECIMAL(12,4) DEFAULT 0,

            production_indirect_cost_pct DECIMAL(6,3) DEFAULT 0,
            production_cost_per_part DECIMAL(12,6) DEFAULT 0,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_1_3_component_a_labour_cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_1_3_component_a_labour_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            personnel_employment_pct DECIMAL(6,3) DEFAULT 0,
            labour_cost DECIMAL(12,6) DEFAULT 0,
            labour_setup_cost DECIMAL(12,6) DEFAULT 0,
            labour_indirect_cost_pct DECIMAL(6,3) DEFAULT 0,
            labour_cost_per_part DECIMAL(12,6) DEFAULT 0,
        
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_2_1_component_b_material_cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_2_1_component_b_material_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            material_cost DECIMAL(12,6) DEFAULT 0,
            indirect_cost_pct DECIMAL(6,3) DEFAULT 0,
            total_cost DECIMAL(12,6) DEFAULT 0,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_2_2_component_b_production_cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_2_2_component_b_production_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            machine VARCHAR(255),
            tool_nr VARCHAR(10),
            
            production_runs_per_year INT DEFAULT 0,
            finished_parts_per_cycle_tool INT DEFAULT 0,
            finished_parts_per_cycle_part INT DEFAULT 0,

            startup_phaseout_time DECIMAL(10,4) DEFAULT 0,
            cycle_time_sec DECIMAL(10,4) DEFAULT 0,
            downtime_pct DECIMAL(6,3) DEFAULT 0,
            waste_rate_pct DECIMAL(6,3) DEFAULT 0,

            parts_per_production_lot INT DEFAULT 0,
            production_run_duration_hr DECIMAL(12,4) DEFAULT 0,
            annual_machine_time_hr DECIMAL(12,4) DEFAULT 0,
            shots_per_hour DECIMAL(12,4) DEFAULT 0,
            machine_rate DECIMAL(12,4) DEFAULT 0,

            production_indirect_cost_pct DECIMAL(6,3) DEFAULT 0,
            production_cost_per_part DECIMAL(12,6) DEFAULT 0,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_2_3_component_b_labour_cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_2_3_component_b_labour_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            personnel_employment_pct DECIMAL(6,3) DEFAULT 0,
            labour_cost DECIMAL(12,6) DEFAULT 0,
            labour_setup_cost DECIMAL(12,6) DEFAULT 0,
            labour_indirect_cost_pct DECIMAL(6,3) DEFAULT 0,
            labour_cost_per_part DECIMAL(12,6) DEFAULT 0,
        
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_3_tooling_cost_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_3_tooling_cost (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            mould_maintenance_cost_pct DECIMAL(6,3) DEFAULT 0,
            mould_amortization_over_part_costs VARCHAR(100),
            annual_interest_rate_pct DECIMAL(6,3) DEFAULT 0,
            amortization_period_year INT,
            tooling_cost_per_part DECIMAL(6, 3) DEFAULT 0,
        
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_4_purchased_components_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_4_purchased_components (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            material_c DECIMAL(6,3) DEFAULT 0,
            material_c_indirect_cost VARCHAR(100),
            material_c_cost DECIMAL(6,3) DEFAULT 0,
            
            material_d DECIMAL(6,3) DEFAULT 0,
            material_d_indirect_cost VARCHAR(100),
            material_d_cost DECIMAL(6,3) DEFAULT 0,
            
            purchased_components_cost DECIMAL(6,3) DEFAULT 0,
        
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_5_additional_costs_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_5_additional_costs (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            assembly_time_s DECIMAL(6,3) DEFAULT 0,
            assembly_cost_per_part_eur DECIMAL(6,3) DEFAULT 0,
                        
            quality_control_cost_per_part_eur DECIMAL(6,3) DEFAULT 0,
        
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_6_Logistic_calculation_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_6_Logistic_calculation (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
            
            packaging_fix_cost_per_part_eur DECIMAL(6,3) DEFAULT 0,
            
            turnaround_time_days DECIMAL(6,3) DEFAULT 0,
            rent_per_box_per_day_eur DECIMAL(6,3) DEFAULT 0,
            rent_per_pallet_per_day_eur DECIMAL(6,3) DEFAULT 0,
            rent_per_top_per_day_eur DECIMAL(6,3) DEFAULT 0,
            total_rent_per_packaging_unit_per_day_eur DECIMAL(6,3) DEFAULT 0,
            total_rent_per_packaging_unit_per_turnaround_eur DECIMAL(6,3) DEFAULT 0,
            total_rent_per_turnaround_per_part_eur DECIMAL(6,3) DEFAULT 0,
            
            cardborad_inlays_per_box_eur DECIMAL(6,3) DEFAULT 0,
            cardborad_inlays_per_part_eur DECIMAL(6,3) DEFAULT 0,
            
            PE_bag_per_box_eur DECIMAL(6,3) DEFAULT 0,
            PE_bag_per_part_eur DECIMAL(6,3) DEFAULT 0,
            
            setting_time_per_part_s DECIMAL(6,3) DEFAULT 0,
            setting_cost_per_part_eur DECIMAL(6,3) DEFAULT 0,
            
            administration_cost_per_box_label_eur DECIMAL(6,3),
            administration_cost_per_pallet_comminsion_eur DECIMAL(6,3),
            administration_cost_per_delivery_paper_work_eur DECIMAL(6,3),
            admin_cost_per_part_eur DECIMAL(6,3) DEFAULT 0,
            
            total_packaging_cost_A_price DECIMAL(6,3) DEFAULT 0,
            
            transport_cost_per_pallet_eur DECIMAL(6,3) DEFAULT 0,
            transport_cost_per_part_B_price_eur DECIMAL(6,3) DEFAULT 0,
                                
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


def create_quotation_section_3_7_Cost_Split_table():
    query = """
        CREATE TABLE IF NOT EXISTS quotation_section_3_7_cost_split (
            id INT AUTO_INCREMENT PRIMARY KEY,
        
            quotation_id INT NOT NULL,
            position_id INT NOT NULL,
                        
            material_a DECIMAL(6,3) DEFAULT 0,
            material_b DECIMAL(6,3) DEFAULT 0,
            machine_a_b DECIMAL(6,3) DEFAULT 0,
            labour_a_b DECIMAL(6,3) DEFAULT 0,
            tooling_a_b DECIMAL(6,3) DEFAULT 0,
            purchased_components DECIMAL(6,3) DEFAULT 0,
            assembly DECIMAL(6,3) DEFAULT 0,
            quality DECIMAL(6,3) DEFAULT 0,
            logistic_packaging DECIMAL(6,3) DEFAULT 0,
            handling_repacking_costs DECIMAL(6,3) DEFAULT 0,
            manufactured_cost DECIMAL(6,3) DEFAULT 0,
            toller_markup_profit DECIMAL(6,3) DEFAULT 0,
            total_production_cost_part DECIMAL(6,3) DEFAULT 0,
            one_gsc_markup_mu1 DECIMAL(6,3),
            
            responsibility_price_per_part DECIMAL(6,3),
            responsibility_price_per_car DECIMAL(6,3),
            
            mould_cost_prorated_per_part_nr DECIMAL(6,3) DEFAULT 0,
            
            cost_composition DECIMAL(6,3) DEFAULT 0,
            comments VARCHAR(255),
                                
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE (quotation_id, position_id),
        
            FOREIGN KEY (quotation_id)
                REFERENCES parts_projects(id)
                ON DELETE CASCADE,
        
            FOREIGN KEY (position_id)
                REFERENCES parts_positions(id)
                ON DELETE CASCADE

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
    execute_query(query)


# ---------------- Create All Tables ----------------


def create_all_tables():
    create_material_B_Cost_table()
    create_material_A_Cost_table()
    create_material_C_Cost_table()
    create_machinery_Cost_table()
    create_labour_cost_table()
    create_packaging_table()
    create_palette_table()
    create_parts_project_table()
    create_part_concept_table()
    create_design_concept_table()
    create_parts_positions_table()
    create_quotation_section_1_1_pos_project_details_table()
    create_pos_plant_derivatives_table()
    create_quotation_section_1_2_weight_table()
    create_quotation_section_1_3_logistics_table()
    create_deckel_table()
    create_quotation_section_2_tooling_material_table()
    create_quotation_section_2_tooling_totals_table()
    create_quotation_section_3_1_1_component_a_material_cost_table()
    create_quotation_section_3_1_2_component_a_production_cost_table()
    create_quotation_section_3_1_3_component_a_labour_cost_table()
    create_quotation_section_3_2_1_component_b_material_cost_table()
    create_quotation_section_3_2_2_component_b_production_cost_table()
    create_quotation_section_3_2_3_component_b_labour_cost_table()
    create_quotation_section_3_3_tooling_cost_table()
    create_quotation_section_3_4_purchased_components_table()
    create_quotation_section_3_5_additional_costs_table()
    create_quotation_section_3_6_Logistic_calculation_table()
    create_quotation_section_3_7_Cost_Split_table()


create_all_tables()
# =======================================================


def fetch_all(query, params=None):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return []

        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        return cursor.fetchall()

    except Exception as e:
        print("DB Error:", e)
        return []

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def fetch_one(query, params=None):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return None

        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        return cursor.fetchone()

    except Exception as e:
        print("DB Error:", e)
        return None

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def execute(query, params=None):
    conn = get_db_connection()   # or however you connect
    cur = conn.cursor()
    cur.execute(query, params)
    conn.commit()
    cur.close()
    conn.close()

#             <td class="text-end">{{ (r.EVA_Repsol_PA538_percent * 100) | round(2) }} %</td>


"""
debug_data = {
            "quotation_id": quotation_id,
            "pos_id": pos_id,
            
            "material_a": request.form.get(f"material_a[{pos_id}]"),
            "density_mat_a": num(request.form.get(f"density_mat_a[{pos_id}]")),
            "volume_mat_a": num(request.form.get(f"volume_mat_a[{pos_id}]")),
            "weight_mat_a": num(request.form.get(f"weight_mat_a[{pos_id}]")),
        
            "material_b": request.form.get(f"material_b[{pos_id}]"),
            "density_mat_b": num(request.form.get(f"density_mat_b[{pos_id}]")),
            "volume_mat_b": num(request.form.get(f"volume_mat_b[{pos_id}]")),
            "weight_mat_b": num(request.form.get(f"weight_mat_b[{pos_id}]")),
            
            "material_c": request.form.get(f"material_c[{pos_id}]"),
            "density_mat_c": num(request.form.get(f"density_mat_c[{pos_id}]")),
            "volume_mat_c": num(request.form.get(f"volume_mat_c[{pos_id}]")),
            "weight_mat_c": num(request.form.get(f"weight_mat_c[{pos_id}]")),
            
            "material_d": request.form.get(f"material_d[{pos_id}]"),
            "weight_mat_d": num(request.form.get(f"weight_mat_d[{pos_id}]")),
            
            "total_weight": num(request.form.get(f"total_weight[{pos_id}]")),
            "polyamide_weight_per_car": num(request.form.get(f"polyamide_weight_per_car[{pos_id}]")),
            "terophon_terocore_weight_per_car": num(request.form.get(f"terophon_terocore_weight_per_car[{pos_id}]")),
            "steel_weight_per_car": num(request.form.get(f"steel_weight_per_car[{pos_id}]")),
            "other_mat_weight_per_car": num(request.form.get(f"other_mat_weight_per_car[{pos_id}]")),
            "total_weight_per_car": num(request.form.get(f"total_weight_per_car[{pos_id}]")),
        }

        print("=== PACKAGING DEBUG DATA ===")
        for k, v in debug_data.items():
            print(f"{k}: {v}")

"""
