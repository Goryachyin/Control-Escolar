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
app.get('/estudiante/inicio', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'inicio.html')) })
app.get('/estudiante/horario', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'horario.html')) })
app.get('/estudiante/calificaciones', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'calificaciones.html')) })
app.get('/estudiante/kardex', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'kardex.html')) })
app.get('/estudiante/editar_datos', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'estudiante', 'editar_datos.html')) })
app.get('/docentes/visual_grupo', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'docentes', 'visual_grupo.html')) })
app.get('/docentes/pagos', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'docentes', 'pagos.html')) })
app.get('/index', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'index.html')) })
app.get('/superusuario/registrar-estudiante', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'superusuario', 'registrar-estudiante.html')) })
app.get('/superusuario/consultar-estudiante', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'superusuario', 'consultar-estudiante.html')) })
app.get('/superusuario/registrar-docente', (req, res) => { res.sendFile(path.join(__dirname, 'pages', 'superusuario', 'registrar-docente.html')) })
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
  console.log('📩 Datos recibidos:', persona)
  const result = await superuser.methods.registrarPersona(req, res, persona)

  if (result.success) {
    res.status(200).json({ message: 'Persona registrada exitosamente', idPersona: result.idPersona })
  } else {
    // Muestra el error recibido desde el método registrarPersona
    res.status(400).json({ error: result.error || 'Error al registrar la persona' })
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
app.post('/api/superuser/registrar-docente', async (req, res) => {
  try {
    const docente = await superuser.methods.registrarDocente(req, res, req.body)

    return res.status(201).json({
      success: true,
      id: docente.id // Si tienes un ID a devolver
    })
  } catch (error) {
    console.error('❌ Error en endpoint registrar-docente:', error)

    // Errores comunes de PostgreSQL
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'El docente ya está registrado.'
      })
    }

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'La persona asociada no existe en la base de datos.'
      })
    }

    return res.status(500).json({
      error: 'Error interno del servidor.'
    })
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
app.get('/api/superuser/getMaxSemestre/:idCarrera', async (req, res) => {
  try {
    const { idCarrera } = req.params // Obtener el idCarrera de la consulta
    console.log('🔍 Consultando el semestre máximo para la carrera:', idCarrera)
    const result = await pool.query('SELECT MAX(semestre) AS max_semestre FROM public.plan_estudios WHERE id_carrera = $1',
      [idCarrera])

    res.json(result.rows[0]) // Devuelve el semestre máximo en formato JSON
  } catch (error) {
    console.error('Error al obtener semestres:', error)
    res.status(500).json({ error: 'Error al obtener semestres' })
  }
})
app.get('/api/docente/getGrupos/:id_docente', async (req, res) => {
  try {
    const { id_docente } = req.params; // Obtener el id_docente de los query parameters

    if (!id_docente) {
      return res.status(400).json({ error: 'Se requiere el ID del docente' });
    }

    console.log(`🔍 Consultando grupos para el docente: ${id_docente}`);

    const query = `
      SELECT g.id_grupo, m.nombre_materia, g.periodo, g.aula, g.horario_entrada, g.horario_salida, g.dias_semana,
    COUNT(ga.id_inscripcion) AS alumnos_inscritos
    FROM grupos g
    JOIN plan_estudios m ON g.id_materia = m.id_materia
    LEFT JOIN grupo_alumnos ga ON g.id_grupo = ga.id_grupo
    WHERE g.id_docente = $1
    GROUP BY g.id_grupo, m.nombre_materia
    `;

    const result = await pool.query(query, [id_docente]);

    console.log(`📊 Grupos encontrados: ${result.rowCount}`);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener grupos del docente:', error);
    res.status(500).json({
      error: 'Error al obtener grupos del docente',
      details: error.message
    });
  }
});
module.exports = app

// Inicia el servidor solo en desarrollo local
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`)
  })
}
