-- Seed categorías basadas en los datos del Excel
INSERT INTO categorias (nombre, descripcion, stock_minimo) VALUES
('Desktop', 'Computadoras de escritorio', 10),
('Laptop', 'Computadoras portátiles', 10),
('Impresora', 'Impresoras multifunción', 5),
('Monitor', 'Monitores y pantallas', 5),
('Teclado', 'Teclados de computadora', 20),
('Mouse', 'Mouse de computadora', 20),
('Diadema', 'Diademas con micrófono', 10),
('Bolso', 'Bolsos para laptops', 10),
('Tablet', 'Tabletas', 5),
('Celular', 'Teléfonos celulares', 5),
('Autopago', 'Dispositivos de autopago', 5),
('Pantalla Publicitaria', 'Pantallas para publicidad', 2),
('Almacenamiento', 'Discos duros y memorias', 10),
('Red', 'Equipos de red', 5),
('Audio', 'Equipos de audio', 5),
('Video', 'Equipos de video', 5),
('Periférico', 'Otros periféricos', 10),
('Consumible', 'Tintas, toner y otros consumibles', 15),
('Accesorio', 'Accesorios varios', 10),
('Herramienta', 'Herramientas de trabajo', 5);

-- Seed usuario admin por defecto
INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol) VALUES
('admin', 'admin@fibex.com', '$2a$10$580pIKD3ybYiZem/A1b4/erSeqRg69cQlmtEheenaz3cJqF5JR7fK', 'Administrador del Sistema', 'admin');
