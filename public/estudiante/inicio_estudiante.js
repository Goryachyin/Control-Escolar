document.addEventListener('DOMContentLoaded', async () => {
  // eslint-disable-next-line no-undef
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/estudiante/login'// Redirigir al login si no hay token
    console.log('No hay token (inicio, linea 6)')
    return
  }

  fetch('/api/verificar-token', {
    method: 'GET',
    headers: {
      // eslint-disable-next-line quote-props
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      if (!data.valid) {
        // eslint-disable-next-line no-undef
        localStorage.removeItem('token') // Eliminar token inválido
        window.location.href = '/estudiante/login'
      }
    })
    .catch(error => {
      console.error('Error al verificar token (inicio, linea 26):', error)
      window.location.href = '/estudiante/login'
    })

  // Obtener datos del usuario
  fetch('/api/estudiante/datos-usuario', {
    method: 'GET',
    headers: {
      // eslint-disable-next-line quote-props
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log('📩 Datos del usuario:', data)
      document.getElementById('titulo-bienvenida').textContent = 'Bienvenido ' + data.nombre_persona
      document.getElementById('nombre').textContent = data.nombre_persona + ' ' + data.apellido_p_persona + ' ' + data.apellido_m_persona
      document.getElementById('subtitulo-bienvenida').textContent = data.nombre_carrera + ' - ' + data.semestre_estudiante + '° semestre'
      document.getElementById('correo').textContent = data.correo_persona
    })
    .catch(error => {
      console.error('Error al obtener datos del usuario (inicio, linea 51):', error)
    })
})
