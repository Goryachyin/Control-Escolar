const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const secretKey = process.env.JWT_SECRET || 'secreto_super_seguro'

async function buscarAlumnos(req, res) {
    const query = req.body;
    console.log('Consulta recibida:', query);

    try {
        const consulta = await pool.query(
            'SELECT * FROM estudiante WHERE numero_control = $1',
            [query.numero_control]
        );

        if (consulta.rows.length > 0) {
            console.log('Consulta exitosa:', consulta.rows);
            res.json(consulta.rows); // returns just one row
        } else {
            console.log('No se encontraron resultados');
            res.status(404).json({ error: 'No se encontraron resultados' });
        }

    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

export const methods = {
        buscarAlumnos
  }
      