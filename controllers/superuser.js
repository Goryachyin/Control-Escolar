/* eslint-disable camelcase */
const pool = require('../conexion.js').pool

async function registrarPersona (req, res, persona) {
  console.log('🔹 Recibiendo solicitud para registrar persona... (Superuser, linea 7)')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Verificar si ya existe un usuario con el mismo CURP o NSS
    const checkPersona = await client.query(
      'SELECT * FROM public.datos_personales WHERE curp_persona = $1 OR nss_persona = $2',
      [persona.curp, persona.nss]
    )

    if (checkPersona.rows.length > 0) {
      // Si existe un registro con el mismo CURP o NSS, retornar un error
      return {
        success: false,
        error: 'Ya existe un usuario con el mismo CURP o NSS.'
      }
    }

    // Insertar los datos personales si no existen duplicados
    const result = await client.query(
      'INSERT INTO public.datos_personales (nombre_persona, apellido_p_persona, apellido_m_persona, telefono_persona, curp_persona, nss_persona, sexo_persona) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_persona',
      [persona.nombre, persona.apellido_p, persona.apellido_m, persona.telefono, persona.curp, persona.nss, persona.sexo]
    )

    const idPersona = result.rows[0].id_persona
    console.log('Persona registrada con ID:', idPersona)

    await client.query('COMMIT')
    return { success: true, idPersona } // Retorna el ID de la persona registrada
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al registrar los datos personales:', error)
    return { success: false, error: 'Error al registrar los datos. Intenta nuevamente.' }
  } finally {
    client.release()
  }
}

async function registrarEstudiante (req, res, estudiante) {
  console.log('🔹 Recibiendo solicitud para registrar estudiante... (Superuser, linea 35)')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Insertar el estudiante en la base de datos, incluyendo todos los campos requeridos
    await client.query(
      'INSERT INTO public.estudiante (numero_control, correo_institucional, semestre_estudiante, estatus_estudiante, contrasena_estudiante, id_persona, id_carrera, id_documento, id_pago) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        estudiante.numero_control,
        estudiante.correo_institucional,
        estudiante.semestre_estudiante,
        estudiante.estatus_estudiante,
        estudiante.contrasena_estudiante,
        estudiante.id_persona,
        estudiante.id_carrera,
        estudiante.id_documento,
        estudiante.id_pago
      ]
    )

    await client.query('COMMIT')
    return { success: true }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al registrar estudiante:', error.message)
    return {
      success: false,
      error: error.message
    }
  } finally {
    client.release()
  }
}

async function registrarDocente (req, res, docente) {
  console.log('🔹 Recibiendo solicitud para registrar docente... (Superuser, línea 85)')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(
      'INSERT INTO public.docente(id_persona, id_docente, correo_institucional, horario_entrada_docente, horario_salida_docente) ' +
      'VALUES ($1, $2, $3, $4, $5)',
      [
        docente.id_persona,
        docente.id_docente,
        docente.correo,
        docente.horarioEntrada,
        docente.horarioSalida
      ]
    )

    await client.query('COMMIT')
    return { success: true }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error al registrar docente:', error)

    // Lanzamos el error para que lo maneje el endpoint
    throw error
  } finally {
    client.release()
  }
}

async function registrarMateriasEnLote (materias) {
  console.log('🔹 Iniciando registro masivo de materias...')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const resultados = []
    const errores = []

    for (const [index, materia] of materias.entries()) {
      try {
        // Validación individual
        if (!materia.id_carrera || !materia.semestre || !materia.nombre_materia ||
            !materia.creditos || !materia.id_materia) {
          // eslint-disable-next-line no-throw-literal
          throw {
            code: 'INVALID_DATA',
            message: `Materia ${index + 1}: Datos incompletos`,
            materiaIndex: index
          }
        }

        // Verificar carrera existe
        const carreraCheck = await client.query(
          'SELECT nombre_carrera FROM carreras_impartidas WHERE id_carrera = $1',
          [materia.id_carrera]
        )

        if (carreraCheck.rows.length === 0) {
          // eslint-disable-next-line no-throw-literal
          throw {
            code: 'CARRE_NOT_FOUND',
            message: `Materia ${index + 1}: Carrera ${materia.id_carrera} no existe`,
            materiaIndex: index
          }
        }

        // Verificar ID materia único
        const materiaCheck = await client.query(
          'SELECT 1 FROM plan_estudios WHERE id_materia = $1',
          [materia.id_materia]
        )

        if (materiaCheck.rows.length > 0) {
          // eslint-disable-next-line no-throw-literal
          throw {
            code: 'MATERIA_DUPLICADA',
            message: `Materia ${index + 1}: ID ${materia.id_materia} ya existe`,
            materiaIndex: index
          }
        }

        // Insertar materia
        const result = await client.query(
          `INSERT INTO plan_estudios(
            id_carrera, semestre, nombre_materia, especialidad, creditos, id_materia
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id_materia, nombre_materia, id_carrera, semestre`,
          [
            materia.id_carrera,
            materia.semestre,
            materia.nombre_materia,
            materia.especialidad,
            materia.creditos,
            materia.id_materia
          ]
        )

        resultados.push({
          ...result.rows[0],
          nombre_carrera: carreraCheck.rows[0].nombre_carrera,
          success: true,
          materiaIndex: index
        })
      } catch (error) {
        errores.push({
          ...error,
          materiaData: materia,
          success: false
        })
      }
    }

    // Si hay errores y ningún éxito, hacer rollback completo
    if (errores.length > 0 && resultados.length === 0) {
      await client.query('ROLLBACK')
      console.log('🔸 Rollback completo - Todos los registros fallaron')
      return { success: false, errores }
    }

    // Si hay mezcla de éxitos y errores, commit parcial
    if (errores.length > 0) {
      await client.query('COMMIT')
      console.log('🔸 Commit parcial - Algunos registros exitosos')
      return {
        success: 'partial',
        resultados,
        errores,
        message: 'Algunas materias no se pudieron registrar'
      }
    }

    // Todo exitoso
    await client.query('COMMIT')
    console.log('✅ Registro masivo completado - Todas las materias registradas')
    return { success: true, resultados }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error en transacción:', error)
    throw error
  } finally {
    client.release()
  }
}

async function registrarDocenteYMateria (req) {
  try {
    const grupos = req.body

    for (const grupo of grupos) {
      const { id_materia, id_docente, aula, horarioEntrada, horarioSalida, diasSeleccionados, cupo } = grupo
      console.log('🔍 Registrando grupo:', { id_materia, id_docente, aula, horarioEntrada, horarioSalida, diasSeleccionados, cupo })

      const query = `
      INSERT INTO public.grupos(
      id_materia, id_docente,  aula, horario_entrada, horario_salida, dias_semana, cupo)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
      `

      const values = [
        id_materia,
        id_docente,
        aula,
        horarioEntrada,
        horarioSalida,
        diasSeleccionados,
        cupo
      ]

      await pool.query(query, values)
      console.log(`✅ Grupo ${id_materia} insertado.`)
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Error al registrar docente y materia en superuser:', error)
    throw error
  }
}
export const methods = {
  registrarPersona,
  registrarEstudiante,
  registrarDocente,
  registrarMateriasEnLote,
  registrarDocenteYMateria
}
