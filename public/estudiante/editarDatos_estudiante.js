document.addEventListener('DOMContentLoaded', () => {
  /* eslint-disable no-undef */
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  if (token && usuario) {
    console.log('✅ Token y usuario encontrados en localStorage.')
    console.log('🔐 Token:', token)
    console.log('👤 Usuario:', usuario)
  } else {
    console.warn('🚫 No se encontraron token y usuario en localStorage. Redirigiendo al login...')
    window.location.href = '/estudiante/login'
  }
})
