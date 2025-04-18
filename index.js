/* eslint-disable camelcase */
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const path = require('path')
const authetications = require('./controllers/authetications.js')
const verifToken = require('./controllers/autorization.js')
const superuser = require('./controllers/superuser.js')
const pool = require('./conexion.js').pool
const port = process.env.PORT || 5500

dotenv.config()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'pages')))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'index.html')) })
app.get('/estudiante/login', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'login.html')) })
app.get('/estudiante/calendarioescolar',  (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'calendarioescolar.html')) })
app.get('/estudiante/inicio', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'inicio.html')) })
app.get('/estudiante/horario', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'horario.html')) })
app.get('/estudiante/calendarioescolar',(req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'calendarioescolar.html')) })
app.get('/estudiante/calificaciones', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'calificaciones.html')) })
app.get('/estudiante/kardex', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'kardex.html')) })
app.get('/index', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'index.html')) })
app.get('/superusuario/registrar-estudiante', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'superusuario', 'registrar-estudiante.html')) })
app.get('/superusuario/consultar-estudiante', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'superusuario', 'consultar-estudiante.html')) })
// API's
app.get('/api/verificar-token', verifToken, (req, res) => { res.json({ valid: true, usuario: req.usuario }) })
app.get('/api/estudiante/datos-usuario', verifToken, async (req, res) => {
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
app.post('/api/estudiante/login', authetications.methods.estudianteLogin)
app.post('/api/superuser/registrar-persona', async (req, res) => {
  console.log('🔹 Recibiendo solicitud para registrar persona... (index, linea 35)')
  const persona = req.body
  console.log('📩 Datos recibidos:', persona) // Para ver qué se está enviando
  const result = await superuser.methods.registrarPersona(req, res, persona)
  if (result.success) {
    res.status(200).json({ message: 'Persona registrada exitosamente', idPersona: result.idPersona })
  } else {
    res.status(500).json({ error: 'Error al registrar la persona' })
  }
})
app.post('/api/superuser/registrar-estudiante', async (req, res) => {
  try {
    // 1. Registrar estudiante en la base de datos
    const estudiante = await superuser.methods.registrarEstudiante(req, res, req.body)

    // 2. Enviar UNA sola respuesta
    res.json({
      success: true,
      id: estudiante.id
    })

    // NO hacer nada después de res.json()
  } catch (error) {
    console.error('Error al registrar estudiante:', error)

    // Manejo específico de errores de clave foránea
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Error de integridad referencial. La persona no existe.'
      })
    }

    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

app.post('/api/superuser/rollback-persona', async (req, res) => {
  const { idPersona } = req.body
  console.log('🔹 Intentando hacer rollback de la persona registrada con ID:', idPersona)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Eliminar la persona registrada si existe (rollback)
    await client.query('DELETE FROM public.datos_personales WHERE id_persona = $1', [idPersona])

    await client.query('COMMIT')
    res.status(200).json({ message: 'Rollback realizado correctamente.' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al hacer rollback:', error)
    res.status(500).json({ error: 'Error al realizar el rollback.' })
  } finally {
    client.release()
  }
})
app.get('/api/superuser/ultimo-numero-control', async (req, res) => {
  try {
    const client = await pool.connect()
    const response = await client.query('SELECT MAX(numero_control) AS ultimoNumeroControl FROM estudiante')
    const ultimoNumeroControl = response.rows[0].ultimonumerocontrol
    const nuevoNumeroControl = parseInt(ultimoNumeroControl) + 1 // Incrementar el último número de control
    console.log('🔍 Último número de control:', nuevoNumeroControl)
    res.json({ nuevoNumeroControl })
  } catch (error) {
    console.error('Error al obtener el último número de control:', error)
    res.status(500).json({ error: 'Error al obtener el último número de control' })
  }
})
app.get('/api/superuser/consultar-estudiante/:matricula', async (req, res) => {
  const numeroControl = req.params.matricula

  try {
    const query = `
    SELECT dp.nombre_persona, dp.apellido_p_persona, dp.apellido_m_persona, e.numero_control, e.correo_institucional, 
    (SELECT carrera.nombre_carrera FROM public.carreras_impartidas as carrera WHERE carrera.id_carrera = e.id_carrera), 
    e.semestre_estudiante, 10, 10, e.estatus_estudiante, dp.curp_persona, dp.telefono_persona 
    FROM public.estudiante as e 
    INNER JOIN public.datos_personales as dp ON dp.id_persona = e.id_persona 
    WHERE e.numero_control = $1`

    const result = await pool.query(query, [numeroControl])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' })
    }

    res.json(result.rows[0]) // Devuelve los datos del estudiante
  } catch (error) {
    console.error('❌ Error al consultar estudiante:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

module.exports = app

// Inicia el servidor solo en desarrollo local
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`)
  })
}
