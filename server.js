const express = require('express')
const bodyParser = require('body-parser')
const { pool } = require('./conexion') // Usamos require para 'pg'
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()
const app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'))
})
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'))
})

app.post('/login', async (req, res) => {
  const { numeroControl, contrasena } = req.body

  try {
    const consulta =
            await pool.query('SELECT * FROM estudiante where numero_control=$1 AND contrasena_estudiante=$2',
              [numeroControl, contrasena]
            )
    console.log(numeroControl)
    console.log(contrasena)
    if (consulta.rows.length > 0) {
      res.json({ success: true, usuario: consulta.rows[0] })
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
    }
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

const port = process.env.port || 5500
app.listen(port, () => {
  console.log(`Servidor escuchando en http://${process.env.DB_HOST}:${port}/main`)
})
