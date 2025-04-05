document.addEventListener('DOMContentLoaded', async () => {
  // eslint-disable-next-line no-undef
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/login'// Redirigir al login si no hay token
    console.log('No hay token, linea 5')
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
        window.location.href = '/login'
      }
    })
    .catch(error => {
      console.error('Error al verificar token:', error)
      window.location.href = '/login'
    })

  // Obtener datos del usuario
  fetch('/api/datos-usuario', {
    method: 'GET',
    headers: {
      // eslint-disable-next-line quote-props
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log('📩 Datos del usuario:', data)
      document.getElementById('nombre').textContent = data.nombre_persona + ' ' + data.apellido_p_persona + ' ' + data.apellido_m_persona
      document.getElementById('matricula').textContent = data.numero_control
      document.getElementById('email').textContent = data.correo_institucional
      document.getElementById('carrera').textContent = data.nombre_carrera
      document.getElementById('semestre').textContent = data.semestre_estudiante
      document.getElementById('promedioSR').textContent = 'En proceso'
      document.getElementById('promedioCR').textContent = 'En proceso'
      document.getElementById('estatus').textContent = data.estatus_estudiante
    })
    .catch(error => {
      console.error('Error al obtener datos del usuario:', error)
    })
})
