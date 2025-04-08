const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const secretKey = process.env.JWT_SECRET || 'secreto_super_seguro'

function verificarToken (req, res, next) {
  // eslint-disable-next-line no-undef
  const token = req.headers.authorization

  if (!token) {
    return res.status(403).json({ error: 'Token requerido' })
  }

  const tokenLimpio = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token
  console.log('Token recibido:', tokenLimpio)

  try {
    const decoded = jwt.verify(tokenLimpio, secretKey)
    console.log('Token decodificado (Autorization, linea 20):', decoded)
    req.usuario = decoded // Guardar los datos del usuario en la request
    next()
  } catch (err) {
    console.error('Error al verificar token (Autorization, linea 24):', err.message)
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

module.exports = verificarToken
