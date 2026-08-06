#!/usr/bin/env python3
"""
Script de migración de datos desde Excel a PostgreSQL
Inventario FIBEX
"""

import psycopg2
import openpyxl
from datetime import datetime
import sys
import os

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'inventariofibex',
    'user': 'postgres',
    'password': 'postgres'
}

def connect_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"Error conectando a la base de datos: {e}")
        sys.exit(1)

def clean_string(value):
    """Clean string value - trim whitespace"""
    if value is None:
        return None
    return str(value).strip() if str(value).strip() else None

def get_or_create_sede(conn, sede_name):
    """Get or create a sede and return its ID"""
    if not sede_name:
        return None
    
    cur = conn.cursor()
    
    # Check if sede exists
    cur.execute("SELECT id FROM sedes WHERE nombre = %s", (sede_name,))
    result = cur.fetchone()
    
    if result:
        return result[0]
    
    # Create new sede
    cur.execute(
        "INSERT INTO sedes (nombre, pais) VALUES (%s, 'Venezuela') RETURNING id",
        (sede_name,)
    )
    conn.commit()
    return cur.fetchone()[0]

def get_or_create_categoria(conn, cat_name):
    """Get or create a category and return its ID"""
    if not cat_name:
        return None
    
    cur = conn.cursor()
    
    # Check if category exists
    cur.execute("SELECT id FROM categorias WHERE nombre = %s", (cat_name,))
    result = cur.fetchone()
    
    if result:
        return result[0]
    
    # Create new category
    cur.execute(
        "INSERT INTO categorias (nombre) VALUES (%s) RETURNING id",
        (cat_name,)
    )
    conn.commit()
    return cur.fetchone()[0]

def map_tipo_to_categoria(tipo):
    """Map Excel tipo to categoria"""
    tipo_map = {
        'DESKTOP': 'Desktop',
        'LAPTOP': 'Laptop',
        'IMPRESORA': 'Impresora',
        'TABLET': 'Tablet',
        'CELULAR': 'Celular',
        'AUTOPAGO': 'Autopago',
        'PANTALLA PUBLICITARIA': 'Pantalla Publicitaria'
    }
    return tipo_map.get(tipo, 'Desktop')

def migrate_data(excel_path):
    """Main migration function"""
    print(f"Iniciando migración desde: {excel_path}")
    
    # Connect to database
    conn = connect_db()
    cur = conn.cursor()
    
    try:
        # Load Excel file
        wb = openpyxl.load_workbook(excel_path, read_only=True)
        ws = wb['Inventario Unificado']
        
        # Skip header rows (first 7 rows are headers/titles)
        rows = list(ws.iter_rows(min_row=8, values_only=True))
        
        print(f"Total de filas a procesar: {len(rows)}")
        
        # Cache for sedes and categorias
        sede_cache = {}
        cat_cache = {}
        
        articulos_created = 0
        stock_created = 0
        beneficiarios_created = 0
        
        for i, row in enumerate(rows):
            if i % 100 == 0:
                print(f"Procesando fila {i + 1} de {len(rows)}...")
            
            # Extract values from row
            usuario = clean_string(row[0])  # USUARIO
            ubicacion = clean_string(row[1])  # UBICACION
            sede_name = clean_string(row[2])  # SEDE
            departamento = clean_string(row[3])  # DEPARTAMENTO
            nombre_pc = clean_string(row[4])  # NOMBRE PC
            os_info = clean_string(row[5])  # OS
            cpu = clean_string(row[6])  # CPU
            memoria = clean_string(row[7])  # MEMORIA GB
            disco = clean_string(row[8])  # DISCO
            tipo = clean_string(row[9])  # TIPO
            marca = clean_string(row[10])  # MARCA
            modelo = clean_string(row[11])  # MODELO
            serial = clean_string(row[12])  # SERIAL
            
            # Skip empty rows
            if not tipo and not nombre_pc:
                continue
            
            # Get or create sede
            sede_id = None
            if sede_name:
                if sede_name not in sede_cache:
                    sede_cache[sede_name] = get_or_create_sede(conn, sede_name)
                sede_id = sede_cache[sede_name]
            
            # Get or create category
            cat_nombre = map_tipo_to_categoria(tipo) if tipo else 'Desktop'
            if cat_nombre not in cat_cache:
                cat_cache[cat_nombre] = get_or_create_categoria(conn, cat_nombre)
            cat_id = cat_cache[cat_nombre]
            
            # Create article if we have enough info
            if nombre_pc and nombre_pc != '-':
                sku = f"FIBEX-{nombre_pc.replace('FIBEX-', '').replace('FB-', '')}"
                
                # Check if article exists
                cur.execute("SELECT id FROM articulos WHERE sku = %s", (sku,))
                existing = cur.fetchone()
                
                if not existing:
                    # Build description
                    desc_parts = []
                    if os_info:
                        desc_parts.append(f"OS: {os_info}")
                    if cpu:
                        desc_parts.append(f"CPU: {cpu}")
                    if memoria:
                        desc_parts.append(f"RAM: {memoria}")
                    if disco:
                        desc_parts.append(f"Disco: {disco}")
                    descripcion = ' | '.join(desc_parts) if desc_parts else None
                    
                    # Generate codes
                    import uuid
                    codigo_barras = f"BC-{str(uuid.uuid4())[:8].upper()}"
                    codigo_qr = f"QR-{str(uuid.uuid4())[:8].upper()}"
                    
                    cur.execute("""
                        INSERT INTO articulos (sku, nombre, descripcion, marca, modelo, categoria_id, codigo_barras, codigo_qr)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (sku, nombre_pc, descripcion, marca, modelo, cat_id, codigo_barras, codigo_qr))
                    
                    articulo_id = cur.fetchone()[0]
                    articulos_created += 1
                    
                    # Create stock record
                    if sede_id:
                        cur.execute("""
                            INSERT INTO stock (articulo_id, sede_id, cantidad, stock_minimo)
                            VALUES (%s, %s, 1, 5)
                            ON CONFLICT (articulo_id, sede_id) DO NOTHING
                        """, (articulo_id, sede_id))
                        stock_created += 1
            
            # Create beneficiary if we have user info
            if usuario and usuario != '-' and usuario != 'POR ASIGNAR':
                # Check if beneficiary exists
                cur.execute("SELECT id FROM beneficiarios WHERE nombre_completo = %s", (usuario,))
                existing_ben = cur.fetchone()
                
                if not existing_ben:
                    # Generate a fake cedula for now
                    cedula = f"V-{hash(usuario) % 10000000}"
                    
                    cur.execute("""
                        INSERT INTO beneficiarios (cedula, nombre_completo, dependencia, sede_id)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (cedula) DO NOTHING
                    """, (cedula, usuario, departamento, sede_id))
                    beneficiarios_created += 1
        
        conn.commit()
        print(f"\nMigración completada:")
        print(f"  - Artículos creados: {articulos_created}")
        print(f"  - Registros de stock: {stock_created}")
        print(f"  - Beneficiarios creados: {beneficiarios_created}")
        
    except Exception as e:
        conn.rollback()
        print(f"Error durante la migración: {e}")
        raise
    finally:
        cur.close()
        conn.close()
        wb.close()

if __name__ == '__main__':
    # Default Excel path
    excel_path = os.path.join(os.path.dirname(__file__), '..', '..', 'Inventario_Unificado_Fibex.xlsx')
    
    if len(sys.argv) > 1:
        excel_path = sys.argv[1]
    
    if not os.path.exists(excel_path):
        print(f"Error: No se encontró el archivo {excel_path}")
        sys.exit(1)
    
    migrate_data(excel_path)
