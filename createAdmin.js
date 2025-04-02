const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Conexión a la base de datos
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

// Usuario y contraseña
const username = 'maxi';
const plainPassword = 'tuqui2025';  // La contraseña en texto claro

// Hashear la contraseña
bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
    if (err) {
        console.error('Error al generar el hash de la contraseña:', err);
        return;
    }

    // Insertar el administrador en la base de datos
    const query = 'INSERT INTO admins (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error al insertar administrador:', err);
        } else {
            console.log('Administrador "maxi" creado con éxito');
        }
        db.end(); // Cerrar la conexión a la base de datos
    });
});

