#!/usr/bin/env python3
"""
Importador de InventarioFIBEX desde Excel
Lee la hoja 'Total Equipos' y crea registros en la BD PostgreSQL
"""

import openpyxl
import psycopg2
import uuid
import re
from datetime import datetime

EXCEL_PATH = '/home/adavel/inventariofibex/Inventario_Unificado_Fibex.xlsx'
DB_CONFIG = {
    'host': 'localhost',
    'port': 5434,
    'database': 'inventariofibex',
    'user': 'admin',
    'password': 'Abcd1234'
}

def clean_text(val):
    if val is None:
        return None
    s = str(val).strip()
    if s in ('-', 'NO', 'no', 'N/A', 'N/P', 'S/N', 'S/N '):
        return None
    return s if s else None

def parse_date(val):
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.date()
    s = str(val).strip()
    if not s or s in ('-', 'NO', 'no'):
        return None
    for fmt in ('%d/%m/%Y', '%d/%m/%y', '%Y-%m-%d'):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None

def get_or_create_sede(cur, nombre):
    if not nombre:
        return None
    cur.execute("SELECT id FROM sedes WHERE nombre = %s", (nombre,))
    row = cur.fetchone()
    if row:
        return row[0]
    sid = str(uuid.uuid4())
    cur.execute("INSERT INTO sedes (id, nombre) VALUES (%s, %s)", (sid, nombre))
    return sid

def get_or_create_beneficiario(cur, nombre, sede_id):
    if not nombre:
        return None
    nombre = nombre.upper()[:150]
    cur.execute("SELECT id FROM beneficiarios WHERE nombre_completo = %s", (nombre,))
    row = cur.fetchone()
    if row:
        return row[0]
    bid = str(uuid.uuid4())
    cedula = f"V-{uuid.uuid4().hex[:8].upper()}"
    cur.execute(
        "INSERT INTO beneficiarios (id, cedula, nombre_completo, sede_id) VALUES (%s, %s, %s, %s)",
        (bid, cedula, nombre, sede_id)
    )
    return bid

def get_or_create_categoria(cur, nombre):
    if not nombre:
        return None
    nombre = nombre.upper()[:100]
    cur.execute("SELECT id FROM categorias WHERE nombre = %s", (nombre,))
    row = cur.fetchone()
    if row:
        return row[0]
    cid = str(uuid.uuid4())
    cur.execute("INSERT INTO categorias (id, nombre) VALUES (%s, %s)", (cid, nombre))
    return cid

def get_or_create_articulo(cur, tipo, marca, modelo, cat_id):
    sku_base = f"{(tipo or 'EQ')[:3]}-{(marca or 'GEN')[:3]}"
    cur.execute("SELECT id FROM articulos WHERE sku LIKE %s AND marca = %s AND modelo = %s",
                (f"{sku_base}%", marca, modelo))
    row = cur.fetchone()
    if row:
        return row[0]
    aid = str(uuid.uuid4())
    sku = f"{sku_base}-{uuid.uuid4().hex[:4].upper()}"
    cur.execute(
        """INSERT INTO articulos (id, sku, nombre, marca, modelo, categoria_id)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (aid, sku, f"{tipo or 'EQUIPO'} {marca or ''} {modelo or ''}".strip(), marca, modelo, cat_id)
    )
    return aid

def main():
    print("Abriendo Excel...")
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    ws = wb['Total Equipos']

    print("Conectando a PostgreSQL...")
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cur = conn.cursor()

    # Mapeo de tipos a categorias
    tipo_map = {
        'DESKTOP': 'Desktop',
        'LAPTOP': 'Laptop',
        'IMPRESORA': 'Impresora',
        'AUTOPAGO': 'Autopago',
        'CELULAR': 'Celular',
        'TABLET': 'Tablet',
        'PANTALLA PUBLICITARIA': 'Pantalla Publicitaria',
    }

    # Precargar sedes existentes
    cur.execute("SELECT id, nombre FROM sedes")
    sedes_cache = {row[1]: row[0] for row in cur.fetchall()}

    # Precargar beneficiarios existentes
    cur.execute("SELECT id, nombre_completo FROM beneficiarios")
    ben_cache = {row[1]: row[0] for row in cur.fetchall()}

    # Precargar categorias existentes
    cur.execute("SELECT id, nombre FROM categorias")
    cat_cache = {row[1]: row[0] for row in cur.fetchall()}

    rows_ok = 0
    rows_err = 0
    sedes_new = 0
    ben_new = 0

    for i, row in enumerate(ws.iter_rows(min_row=8, values_only=True), 1):
        try:
            usuario = clean_text(row[0])
            ubicacion = clean_text(row[1])
            sede_nombre = clean_text(row[2])
            departamento = clean_text(row[3])
            nombre_pc = clean_text(row[4])
            os_val = clean_text(row[5])
            cpu = clean_text(row[6])
            memoria = clean_text(row[7])
            disco = clean_text(row[8])
            tipo = clean_text(row[9])
            marca = clean_text(row[10])
            modelo = clean_text(row[11])
            serial = clean_text(row[12])
            ip = clean_text(row[14])
            mac = clean_text(row[15])
            password_pc = clean_text(row[16])
            diadema = clean_text(row[17])
            diadema_fecha = parse_date(row[18])
            mouse = clean_text(row[19])
            mouse_modelo = clean_text(row[20])
            mouse_fecha = parse_date(row[21])
            teclado = clean_text(row[22])
            teclado_modelo = clean_text(row[23])
            teclado_fecha = parse_date(row[24])
            monitor = clean_text(row[25])
            monitor_modelo = clean_text(row[26])
            monitor_fecha = parse_date(row[27])
            bolsos = clean_text(row[28])
            bolsos_fecha = parse_date(row[29])
            last_update = parse_date(row[30])

            if not nombre_pc:
                rows_err += 1
                continue

            # Determinar estado
            estado = 'asignado'
            if usuario and 'REVISION' in usuario.upper():
                estado = 'en_revision'
                usuario = None

            # Sede
            sede_id = None
            sede_key = sede_nombre
            if sede_key:
                if sede_key not in sedes_cache:
                    sede_id = get_or_create_sede(cur, sede_key)
                    sedes_cache[sede_key] = sede_id
                    sedes_new += 1
                else:
                    sede_id = sedes_cache[sede_key]

            # Beneficiario
            ben_id = None
            if usuario:
                usuario_upper = usuario.upper()[:150]
                if usuario_upper not in ben_cache:
                    ben_id = get_or_create_beneficiario(cur, usuario, sede_id)
                    ben_cache[usuario_upper] = ben_id
                    ben_new += 1
                else:
                    ben_id = ben_cache[usuario_upper]

            # Categoria
            cat_nombre = tipo_map.get(tipo, tipo)
            cat_id = None
            if cat_nombre:
                if cat_nombre not in cat_cache:
                    cat_id = get_or_create_categoria(cur, cat_nombre)
                    cat_cache[cat_nombre] = cat_id
                else:
                    cat_id = cat_cache[cat_nombre]

            # Articulo
            art_id = get_or_create_articulo(cur, tipo, marca, modelo, cat_id)

            # Insertar equipo_trabajo
            eq_id = str(uuid.uuid4())
            cur.execute(
                """INSERT INTO equipos_trabajo (
                    id, nombre_pc, serial, os, cpu, memoria, disco, ip, mac, password_pc,
                    articulo_id,
                    diadema_marca, diadema_fecha,
                    mouse_marca, mouse_modelo, mouse_fecha,
                    teclado_marca, teclado_modelo, teclado_fecha,
                    monitor_marca, monitor_modelo, monitor_fecha,
                    bolsos, bolsos_fecha,
                    beneficiario_id, sede_id, departamento,
                    estado, last_update
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s,
                    %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s, %s,
                    %s, %s
                )""",
                (eq_id, nombre_pc, serial, os_val, cpu, memoria, disco, ip, mac, password_pc,
                 art_id,
                 diadema, diadema_fecha,
                 mouse, mouse_modelo, mouse_fecha,
                 teclado, teclado_modelo, teclado_fecha,
                 monitor, monitor_modelo, monitor_fecha,
                 bolsos, bolsos_fecha,
                 ben_id, sede_id, departamento,
                 estado, last_update)
            )

            rows_ok += 1
            if rows_ok % 100 == 0:
                print(f"  Procesadas: {rows_ok} filas...")
                conn.commit()

        except Exception as e:
            rows_err += 1
            print(f"  Error fila {i}: {e}")
            conn.rollback()
            continue

    conn.commit()
    cur.close()
    conn.close()

    print()
    print(f"=== Importacion completada ===")
    print(f"  Equipos importados: {rows_ok}")
    print(f"  Errores: {rows_err}")
    print(f"  Sedes nuevas: {sedes_new}")
    print(f"  Beneficiarios nuevos: {ben_new}")

if __name__ == '__main__':
    main()
