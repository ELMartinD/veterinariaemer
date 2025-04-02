const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '120723',
    database: 'veterinaria'
});

db.connect(err => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        throw err;
    }
    console.log('Conectado a la base de datos');
});

// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones
app.use(session({
    secret: 'secreto_supersecreto',
    resave: false,
    saveUninitialized: false,
}));

// Página de inicio de sesión
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html'); // Ruta a tu formulario HTML
});

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
            // Si no se encuentra el usuario
            return res.status(401).send('Nombre de usuario incorrecto');
        }

        // Comprobamos que la contraseña sea correcta
        const admin = result[0];
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).send('Error al verificar la contraseña');
            }

            if (!isMatch) {
                return res.status(401).send('Contraseña incorrecta');
            }

            // Autenticación exitosa, creamos la sesión
            req.session.user = admin;
            return res.redirect('/admin');  // Redirige a la página del admin
        });
    });
});

// Página exclusiva para administradores (solo accesible si están logueados)
app.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Si no está logueado, redirige al login
    }

    // Si está autenticado, muestra la página admin.html
    res.sendFile(__dirname + '/admin.html'); // Ruta a tu página de administración
});

// Cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login'); // Redirige al login después de cerrar sesión
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
