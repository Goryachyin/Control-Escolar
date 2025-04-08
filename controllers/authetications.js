import { pool } from '../conexion.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

async function login (req, res) {
  console.log('🔹 Recibiendo solicitud de login... (Authetications, linea 7)')
  console.log('📩 Datos recibidos (Authetications, linea 8):', req.body) // Para ver qué se está enviando

  const { numeroControl, contrasena } = req.body
  try {
    const consulta = await pool.query(
      'SELECT * FROM estudiante WHERE numero_control=$1',
      [numeroControl]
    )

    if (consulta.rows.length > 0) {
      const usuario = consulta.rows[0]

      // Verificar la contraseña (si está cifrada, usa bcrypt)
      if (usuario.contrasena_estudiante !== contrasena) {
        console.log('❌ Contraseña incorrecta (Authetications, linea 22)')
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
      }

      const token = jwt.sign(
        { id: usuario.id, numeroControl: usuario.numero_control },
        process.env.JWT_SECRET,
        { expiresIn: '1m' }
      )

      console.log('✅ Login exitoso, enviando token...(Authetications, linea 32)')
      res.json({ success: true, token, usuario })
    } else {
      console.log('❌ Usuario no encontrado (Authetications, linea 35)')
      res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
    }
  } catch (e) {
    console.error('🔥 Error en login (Authetications, linea 39):', e)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const methods = {
  login
}
