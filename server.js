const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const cors = require('cors');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());  // Habilitar CORS para permitir solicitudes desde el frontend

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '120723',
    database: 'veterinaria'
});

db.connect(err => {
    if (err) {
        console.error('Error de conexión a la base de datos: ', err);
        throw err;
    }
    console.log('Conectado a la base de datos');
});

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Ruta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Nombre único para cada archivo
    }
});

const upload = multer({ storage: storage });

// Ruta para agregar productos
app.post('/admin/add-product', upload.single('imagen'), (req, res) => {
    const { nombre, precio, descripcion, precio_descuento, seccion } = req.body;
    const imagen = req.file ? req.file.filename : 'default.jpg';  // Valor por defecto si no se sube imagen

    const checkQuery = 'SELECT * FROM publicaciones WHERE nombre = ?';
    db.query(checkQuery, [nombre], (err, result) => {
        if (err) {
            console.error('Error al verificar el producto:', err);
            return res.status(500).send('Error al verificar el producto');
        }

        if (result.length > 0) {
            // El producto ya existe, no lo agregamos
            return res.status(400).send('El producto ya existe');
        }

        // Si no existe, insertamos el nuevo producto
        const query = 'INSERT INTO publicaciones (nombre, precio, descripcion, precio_descuento, imagen, seccion) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [nombre, precio, descripcion, precio_descuento, imagen, seccion], (err, result) => {
            if (err) {
                console.error('Error al guardar el producto:', err);
                return res.status(500).send('Error al guardar el producto');
            }

            // Obtener el ID del producto recién creado
            const productoId = result.insertId;

            // Cálculo del descuento
            const precioOriginal = parseFloat(precio);
            const precioDescuento = parseFloat(precio_descuento);
            const descuento = precioOriginal - precioDescuento;
            const porcentajeDescuento = (descuento / precioOriginal) * 100;

            // Generar el HTML usando la plantilla que proporcionaste
            const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tienda Veterinaria</title>
    <link rel="stylesheet" href="css.css">
        <link rel="stylesheet" href="/css/publicaciones.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <div class="header1">
            <a href="/index.html"><img class="img-logo" src="/img/EMERGENCIA VETERINARIA Logo - White with Black Background - 5000x5000.png" alt="Logo"></a>
        </div>
    
        <div class="header2">
            <input type="text" class="search-bar" placeholder="Buscar..." id="searchInput">
            <div id="searchResults"></div> <!-- Aquí aparecerán los resultados de búsqueda -->
        </div>
    
        <div class="header3">
            <img style="width: 30px;" src="/img/whatsapp.png" alt="">
            <a class="btn-nav" href="#productos">381 543 353 64</a>
            <img style="width: 30px;" src="/img/usuario.png" alt="">
        </div>
    
        <nav>
            <ul>
                <a href="/ofertas.html">Ofertas<img class="barritaabajo" src="/img/arrow_drop_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt=""></a>
            </ul>

            <ul>
                <a href="/perros.html">Perros<img class="barritaabajo" src="/img/arrow_drop_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt=""></a>
            </ul>

            <ul>
                <a href="/gatos.html">Gatos<img class="barritaabajo" src="/img/arrow_drop_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt=""></a>
            </ul>
        </nav>
    </header>

    <div class="producto-detalle">
        <div class="imagen-container" style="position: relative;">
            <!-- Mostrar el cartelito de descuento si el producto tiene un descuento -->
            <div class="oferta">${precio_descuento ? `<span class="descuento">${Math.round(porcentajeDescuento)}% OFF</span>` : ''}</div>
            <img class="img-auto" src="/uploads/${imagen || 'default.jpg'}" alt="${nombre}">
        </div>

        <div class="producto-info">
            <h1>${nombre}</h1>

            <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                <p class="precio">$ ${precio}</p>
                <p class="precio-descuento">$ ${precio_descuento || 'N/A'}</p>
            </div>

            <div class="botones">
                <a href="/comprar/${productoId}" class="boton">Comprar ahora</a>
                
                <!-- Botón para agregar al carrito con data-* -->
                <button class="botoncarrito" 
                        data-id="${productoId}" 
                        data-nombre="${nombre.replace(/"/g, '&quot;')}" 
                        data-precio="${precio}" 
                        data-precio_descuento="${precio_descuento || 'null'}" 
                        data-imagen="${imagen || 'default.jpg'}" 
                        onclick="agregarAlCarrito(event)">
                    <img class="shop" src="/img/shopping_cart_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt="">
                </button>
            </div>

            <div class="descripcion-container">
                <h3>Descripción completa</h3>
                <p>${descripcion}</p>
            </div>
        </div>
    </div>

    <!-- Solo la sección de ofertas si hay productos en esa categoría -->
    <div class="seccion1" id="ofertas-section" style="margin-top: 20px;">
        <div class="ofertas">
            <h1>Ofertas</h1>
        </div>
    </div>

        <!-- Panel del carrito -->
        <div id="carrito-panel" class="carrito-panel"></div>

        <!-- Total del carrito -->
        <div id="total-carrito" class="total-carrito"></div>
                    
        <div id="ofertas" class="productos"></div>

        <div class="seccion2">
        <h1>Marcas con la que trabajamos</h1>

        <div class="marcas">

            <img class="marcaimg" src="/img/brand2.png" alt="">
            <img class="marcaimg" src="/img/brand3.png" alt="">
            <img class="marcaimg" src="/img/brand4.png" alt="">
            <img class="marcaimg" src="/img/brand5.png" alt="">

        </div>
    </div>
        <div class="seccion1">
            <h1>Perros</h1>
        </div>
        <div id="perros" class="productos"></div>
        <div class="seccion1">
            <h1>Gatos</h1>
        </div>
        <div id="gatos" class="productos"></div>
        <div id="otros" class="productos"></div>

        <div class="noticias">

        <div class="noticias-cont">
            <p class="naranja">Se parte de la familia.</p>
            <p>Suscribite para recibir todas nuestras ofertas y novedades</p>
        </div>

        <div class="noticias-cont2">
            <input class="email" type="email" name="" id="" placeholder="ejemplo@gmail.com">
            <button class="boton-naranja" type="submit">Enviar</button>
        </div>

    </div>

    


     <!-- Footer principal -->
     <footer class="footer">
        <div class="container">
            <div class="footer-section">
                <h3>Nosotros</h3>
                <ul>
                    <li><a href="#">Sobre Nosotros</a></li>
                    <li><a href="#">Sucursales</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Ayuda</h3>
                <ul>
                    <li><a href="#">Medios de pago</a></li>
                    <li><a href="#">Envíos</a></li>
                    <li><a href="#">Preguntas frecuentes</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Cuenta</h3>
                <ul>
                    <li><a href="#">Mis pedidos</a></li>
                    <li><a href="#">Wishlist</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>¡Síguenos!</h3>
                <div class="alinear">
                    <div class="redes">
                        <a href="#"><img style="width: 25px;" src="img/social.png" alt="">Instagram</a>
                    </div>

                    <div class="redes">
                        <a href="#"><img style="width: 25px;" src="img/facebook.png" alt="">Facebook</a>
                    </div>

                </div>
                <p><a style="text-decoration: none; color: rgba(0, 0, 0, 0.633);" href="#">Botón de arrepentimiento</a></p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© Emergencia Veterinaria | <a href="#">Términos y condiciones</a></p>
        </div>
    </footer>

        <script src="mostrar.js"></script>
        <script src="/server.js"></script>
        <script src="/script.js"></script>
        <script src="/buscar.js"></script>
    </body>
    </html>
`;

            // Escribir el archivo HTML en la carpeta 'productos'
            const filePath = path.join(__dirname, 'productos', `${productoId}.html`);
            fs.writeFile(filePath, htmlContent, (err) => {
                if (err) {
                    console.error('Error al actualizar el archivo HTML:', err);
                    return res.status(500).send('Error al crear el archivo de detalles');
                }

                // Responder con éxito
                res.send('Producto guardado correctamente y página de detalles generada');
            });
        });
    });
});


app.post('/producto', (req, res) => {
    // Obtener los datos de la solicitud
    const { nombre, precio, descripcion, precio_descuento, imagen } = req.body;

    // Si la imagen no se proporciona, asignar un valor predeterminado
    const imagenFinal = imagen || 'default.jpg'; // Aquí se asigna una imagen por defecto si no se proporciona

    // Realizar la consulta SQL
    const query = 'INSERT INTO productos (nombre, precio, descripcion, precio_descuento, imagen) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [nombre, precio, descripcion, precio_descuento, imagenFinal], (err, result) => {
        if (err) {
            console.error('Error al insertar producto:', err);
            return res.status(500).send('Error al insertar producto');
        }
        res.send('Producto agregado correctamente');
    });
});

// Supongamos que los datos vienen de una solicitud POST
app.post('/producto', (req, res) => {
    const { nombre, precio, descripcion, precio_descuento, imagen } = req.body;

    // Asegurarse de que imagenFinal esté definida, si no se proporciona, asignar 'default.jpg'
    const imagenFinal = imagen || 'default.jpg';

    // Consulta SQL para insertar el producto
    const query = 'INSERT INTO productos (nombre, precio, descripcion, precio_descuento, imagen) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [nombre, precio, descripcion, precio_descuento, imagenFinal], (err, result) => {
        if (err) {
            console.error('Error al insertar producto:', err);
            return res.status(500).send('Error al insertar producto');
        }
        res.send('Producto agregado correctamente');
    });
});



// Ruta para editar un producto
app.post('/admin/edit-product/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { nombre, precio, descripcion, precio_descuento, seccion } = req.body;
    
    // Verificar si se ha subido una nueva imagen
    const imagenNueva = req.file ? req.file.filename : null;

    // Si no se ha subido una nueva imagen, primero obtenemos la imagen existente en la base de datos
    let getImageQuery = 'SELECT imagen FROM publicaciones WHERE id = ?';
    db.query(getImageQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener la imagen existente:', err);
            return res.status(500).send('Error al obtener la imagen');
        }

        // Si no se sube una nueva imagen, mantenemos la imagen existente
        let imagenFinal = imagenNueva ? imagenNueva : result[0].imagen;

        // Calcular el descuento
        const precioOriginal = parseFloat(precio);
        const precioDescuento = parseFloat(precio_descuento);
        const descuento = precioOriginal - precioDescuento;
        const porcentajeDescuento = (descuento / precioOriginal) * 100;

        // Construir la consulta para actualizar los datos del producto
        let query = 'UPDATE publicaciones SET nombre = ?, precio = ?, descripcion = ?, precio_descuento = ?, seccion = ?, imagen = ? WHERE id = ?';
        let queryParams = [nombre, precio, descripcion, precio_descuento, seccion, imagenFinal, id];

        // Ejecutar la consulta para actualizar el producto
        db.query(query, queryParams, (err, result) => {
            if (err) {
                console.error('Error al actualizar el producto:', err);
                return res.status(500).send('Error al actualizar el producto');
            }

            // Generar el HTML con los nuevos datos
            const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tienda Veterinaria</title>
        <link rel="stylesheet" href="css.css">
        <link rel="stylesheet" href="/css/publicaciones.css">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    </head>
    <body>
        <header>
            <div class="header1">
                <a href="/index.html"><img class="img-logo" src="/img/EMERGENCIA VETERINARIA Logo - White with Black Background - 5000x5000.png" alt="Logo"></a>
            </div>
        
            <div class="header2">
                <input type="text" class="search-bar" placeholder="Buscar..." id="searchInput">
                <div id="searchResults"></div> <!-- Aquí aparecerán los resultados de búsqueda -->
            </div>
        
            <div class="header3">
                <img style="width: 30px;" src="/img/whatsapp.png" alt="">
                <a class="btn-nav" href="#productos">381 543 353 64</a>
                <img style="width: 30px;" src="/img/usuario.png" alt="">
            </div>
        
            <nav>
            <ul>
                <a href="/ofertas.html">Ofertas<img class="barritaabajo" src="/img/arrow_drop_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt=""></a>
            </ul>

            <ul>
                <a href="/perros.html">Perros<img class="barritaabajo" src="/img/arrow_drop_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt=""></a>
            </ul>

            <ul>
                <a href="/gatos.html">Gatos<img class="barritaabajo" src="/img/arrow_drop_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt=""></a>
            </ul>
        </nav>
        </header>
    
        <div class="producto-detalle">
            <div class="imagen-container" style="position: relative;">
                ${precio_descuento ? `<div class="oferta"><span class="descuento">${Math.round(porcentajeDescuento)}% OFF</span></div>` : ''}
                <img class="img-auto" src="/uploads/${imagenFinal}" alt="${nombre}">
            </div>

            <div class="producto-info">
                <h1>${nombre}</h1>
                <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                    <p class="precio">$ ${precio}</p>
                    <p class="precio-descuento">$ ${precio_descuento || 'N/A'}</p>
                </div>

                <div class="botones">
                    <a href="/comprar/${id}" class="boton">Comprar ahora</a>
                    <!-- Modificado para usar data-* y el evento -->
                    <button class="botoncarrito" 
                            data-id="${id}" 
                            data-nombre="${nombre}" 
                            data-precio="${precio}" 
                            data-precio_descuento="${precio_descuento || 'null'}" 
                            data-imagen="${imagenFinal}" 
                            onclick="agregarAlCarrito(event)">
                        <img class="shop" src="/img/shopping_cart_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt="">
                    </button>
                </div>

                <div class="descripcion-container">
                    <h3>Descripción completa</h3>
                    <p>${descripcion}</p>
                </div>
            </div>
        </div>
    
        <!-- Solo la sección de ofertas si hay productos en esa categoría -->
    <div class="seccion1" id="ofertas-section" style="margin-top: 20px;">
        <div class="ofertas">
            <h1>Ofertas</h1>
        </div>
    </div>

        <!-- Panel del carrito -->
        <div id="carrito-panel" class="carrito-panel"></div>

        <!-- Total del carrito -->
        <div id="total-carrito" class="total-carrito"></div>
                    
        <div id="ofertas" class="productos"></div>

        <div class="seccion2">
        <h1>Marcas con la que trabajamos</h1>

        <div class="marcas">

            <img class="marcaimg" src="/img/brand2.png" alt="">
            <img class="marcaimg" src="/img/brand3.png" alt="">
            <img class="marcaimg" src="/img/brand4.png" alt="">
            <img class="marcaimg" src="/img/brand5.png" alt="">

        </div>
    </div>
        <div class="seccion1">
            <h1>Perros</h1>
        </div>
        <div id="perros" class="productos"></div>
        <div class="seccion1">
            <h1>Gatos</h1>
        </div>
        <div id="gatos" class="productos"></div>
        <div id="otros" class="productos"></div>

        <div class="noticias">

        <div class="noticias-cont">
            <p class="naranja">Se parte de la familia.</p>
            <p>Suscribite para recibir todas nuestras ofertas y novedades</p>
        </div>

        <div class="noticias-cont2">
            <input class="email" type="email" name="" id="" placeholder="ejemplo@gmail.com">
            <button class="boton-naranja" type="submit">Enviar</button>
        </div>

    </div>

    


     <!-- Footer principal -->
     <footer class="footer">
        <div class="container">
            <div class="footer-section">
                <h3>Nosotros</h3>
                <ul>
                    <li><a href="#">Sobre Nosotros</a></li>
                    <li><a href="#">Sucursales</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Ayuda</h3>
                <ul>
                    <li><a href="#">Medios de pago</a></li>
                    <li><a href="#">Envíos</a></li>
                    <li><a href="#">Preguntas frecuentes</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Cuenta</h3>
                <ul>
                    <li><a href="#">Mis pedidos</a></li>
                    <li><a href="#">Wishlist</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>¡Síguenos!</h3>
                <div class="alinear">
                    <div class="redes">
                        <a href="#"><img style="width: 25px;" src="img/social.png" alt="">Instagram</a>
                    </div>

                    <div class="redes">
                        <a href="#"><img style="width: 25px;" src="img/facebook.png" alt="">Facebook</a>
                    </div>

                </div>
                <p><a style="text-decoration: none; color: rgba(0, 0, 0, 0.633);" href="#">Botón de arrepentimiento</a></p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© Emergencia Veterinaria | <a href="#">Términos y condiciones</a></p>
        </div>
    </footer>

        <script src="mostrar.js"></script>
        <script src="/server.js"></script>
        <script src="/script.js"></script>
        <script src="/buscar.js"></script>
    </body>
    </html>
`;

            // Escribir el archivo HTML en la carpeta 'productos'
            const filePath = path.join(__dirname, 'productos', `${id}.html`);
            fs.writeFile(filePath, htmlContent, (err) => {
                if (err) {
                    console.error('Error al actualizar el archivo HTML:', err);
                    return res.status(500).send('Error al actualizar el archivo de detalles');
                }

                res.send('Producto actualizado correctamente y página de detalles regenerada');
            });
        });
    });
});




// Ruta para obtener las publicaciones
app.get('/productos', (req, res) => {
    const query = 'SELECT * FROM publicaciones';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener publicaciones: ', err);
            return res.status(500).send('Error al obtener las publicaciones');
        }
        res.json(result);  // Enviar las publicaciones como respuesta en formato JSON
    });
});

// Ruta para eliminar un producto
app.delete('/admin/delete-product/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM publicaciones WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            return res.status(500).send('Error al eliminar el producto');
        }
        res.send('Producto eliminado correctamente');
    });
});


// Ruta para obtener los detalles de un producto
app.get('/producto/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM publicaciones WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el producto: ', err);
            return res.status(500).send('Error al obtener el producto');
        }
        if (result.length > 0) {
            // Enviar los detalles del producto como respuesta en formato JSON
            res.json({
                id: result[0].id,
                nombre: result[0].nombre,
                precio: result[0].precio,
                precio_descuento: result[0].precio_descuento,
                descripcion: result[0].descripcion,
                imagen: result[0].imagen
            });
        } else {
            res.status(404).send('Producto no encontrado');
        }
    });
});


// Ruta para buscar las publicaciones
app.get('/buscar_publicaciones', (req, res) => {
    const query = req.query.query;

    // Verificar que query no sea vacío o nulo
    if (!query) {
        return res.json([]);  // Si la búsqueda está vacía, no realizamos la consulta
    }

    // Consulta SQL para obtener las publicaciones cuyo nombre comienza con el texto ingresado
    const sql = `
        SELECT id, nombre, descripcion, precio, precio_descuento, imagen
        FROM publicaciones
        WHERE nombre LIKE ? OR descripcion LIKE ?`;
    
    // Ejecutar la consulta
    db.query(sql, [`${query}%`, `%${query}%`], (err, results) => {
        if (err) {
            console.error('Error al obtener las publicaciones:', err);
            return res.status(500).send('Error al obtener las publicaciones');
        }
        res.json(results);  // Devolver las publicaciones encontradas
    });
});


// Configuración de sesiones
app.use(session({
    secret: 'secreto_supersecreto',
    resave: false,
    saveUninitialized: false,
}));

// Manejo del inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Consulta SQL para obtener el administrador con el nombre proporcionado
    const query = 'SELECT * FROM admins WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error al consultar la base de datos');
        }

        if (result.length === 0) {
            return res.status(401).send('Nombre de usuario incorrecto');
        }

        const admin = result[0];
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).send('Error al verificar la contraseña');
            }

            if (!isMatch) {
                return res.status(401).send('Contraseña incorrecta');
            }

            req.session.user = admin;  // Guardamos la sesión del admin

            // Redirigir a admin.html después de iniciar sesión
            return res.redirect('/admin.html');  // Redirige al archivo admin.html
        });
    });
});


// Ruta para proteger la página admin.html
app.get('http://127.0.0.1:5500/admin.html', (req, res) => {
    if (!req.session.user) {
        return res.redirect('http://127.0.0.1:5500/login.html');  // Si no está autenticado, redirigir al login
    }
    res.sendFile(__dirname + '/admin.html');  // Solo si está autenticado, muestra admin.html
});


// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login');  // Redirige al login después de cerrar sesión
    });
});




// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
















