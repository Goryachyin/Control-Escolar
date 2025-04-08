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

export const methods = {
  registrarPersona,
  registrarEstudiante
}
