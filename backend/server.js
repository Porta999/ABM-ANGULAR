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
    const id = parseInt(req.params.id, 10);
    
    // Supongamos que tu tabla se llama "Clientes" y la columna es "ClienteID"
    const sql = 'DELETE FROM Clientes WHERE ClienteID = ?';
    
    db.run(sql, [id], function (err) {
      if (err) {
        console.error('Error al eliminar cliente en la BD:', err);
        return res.status(500).json({ error: err.message });
      }
      // 'this.changes' indica cuántos registros se borraron
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      res.json({ message: 'Cliente eliminado correctamente' });
    });
  });

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
