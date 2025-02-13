const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Configurar middlewares
app.use(cors());
app.use(bodyParser.json());

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('./clientes.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Ruta para obtener todos los clientes
app.get('/Clientes', (req, res) => {
    db.all('SELECT * FROM Clientes', [], (err, rows) => {
        console.log("GET /Clientes recibido")
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Ruta para agregar un cliente
app.post('/Clientes', (req, res) => {
    const { NombreCompleto, Email, Numero, Ciudad, Direccion, CodigoPostal } = req.body;
    const { ClienteID } = req.params;

    if (!NombreCompleto || !Email || !Numero || !Ciudad || !Direccion || !CodigoPostal) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const sql = `INSERT INTO Clientes (NombreCompleto, Email, Numero, Ciudad, Direccion, CodigoPostal) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [NombreCompleto, Email, Numero, Ciudad, Direccion, CodigoPostal];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.json({ ClienteID: this.lastID, NombreCompleto, Email, Numero, Ciudad, Direccion, CodigoPostal });
        }
    });
});

// Ruta para editar clientes

app.put('/Clientes/:ClienteID', (req, res) => {
    const { NombreCompleto, Email, Numero, Ciudad, Direccion, CodigoPostal } = req.body;
    const { ClienteID } = req.params;

    const sql = `UPDATE Clientes SET NombreCompleto = ?, Email = ?, Numero = ?, Ciudad = ?, Direccion = ?, CodigoPostal = ? WHERE ClienteID = ?`;
    const params = [NombreCompleto, Email, Numero, Ciudad, Direccion, CodigoPostal, ClienteID];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            // Retornamos el objeto actualizado; convierte ClienteID a número si es necesario
            res.json({
                ClienteID: Number(ClienteID),
                NombreCompleto,
                Email,
                Numero,
                Ciudad,
                Direccion,
                CodigoPostal
            });
        }
    });
});

app.delete('/api/clientes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = clientes.findIndex(c => c.CustomerID === id);
    
    if (index !== -1) {
        clientes.splice(index, 1);
        res.status(200).send({ message: 'Cliente eliminado' });
    } else {
        res.status(404).send({ message: 'Cliente no encontrado' });
    }
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
