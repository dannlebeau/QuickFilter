const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint para subir y procesar el archivo
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
        }

        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        // Validar que sea un archivo Excel
        if (fileExt !== '.xlsx' && fileExt !== '.xls') {
            fs.unlink(filePath, () => {}); // Eliminar archivo inválido
            return res.status(400).json({ error: 'Formato de archivo no permitido. Solo .xlsx o .xls' });
        }

        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Eliminar el archivo temporal de forma asíncrona
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar el archivo:', err);
        });

        res.json(data);
    } catch (error) {
        console.error('Error procesando el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));
