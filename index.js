const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const path = require('path')
const authetications = require('./app/controllers/authetications.js')
const verifToken = require('./app/controllers/autorization.js')
const pool = require('./app/conexion.js').pool

dotenv.config()
const app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'app', 'pages')))
app.use(express.static(path.join(__dirname, 'app', 'public')))

app.get('/index', (req, res) => { res.sendFile(path.join(__dirname, 'app', 'pages', 'index.html')) })
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, 'app', 'pages', 'login.html')) })
app.get('/inicio', (req, res) => { res.sendFile(path.join(__dirname, 'app', 'pages', 'inicio.html')) })
app.get('/api/verificar-token', verifToken, (req, res) => {
  res.json({ valid: true, usuario: req.usuario })
})
app.get('/api/datos-usuario', verifToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.numeroControl
    console.log('🔍 Consultando datos del usuario:', usuarioId)

    // Consulta los datos del usuario en PostgreSQL
    const result = await pool.query(
      'SELECT dp.nombre_persona, dp.apellido_p_persona, dp.apellido_m_persona, e.numero_control, e.correo_institucional, (SELECT carrera.nombre_carrera FROM public.carreras_impartidas as carrera where carrera.id_carrera = e.id_carrera), e.semestre_estudiante, 10, 10, e.estatus_estudiante FROM public.estudiante as e inner join public.datos_personales as dp ON dp.id_persona = e.id_persona WHERE e.numero_control = $1',
      [usuarioId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' }) // Retorna JSON si no encuentra datos
    }

    res.json(result.rows[0]) // Devuelve los datos en formato JSON
    console.log('📩 Datos del usuario:', result.rows[0])
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error)
    res.status(500).json({ error: 'Error interno del servidor' }) // Retorna JSON si ocurre un error
  }
})

app.post('/api/login', authetications.methods.login)

const port = process.env.port || 5500
app.listen(port, () => {
  console.log(`Servidor escuchando en http://${process.env.DB_HOST}:${port}/index`)
})
