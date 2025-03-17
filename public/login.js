document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm')

  // Mostrar/ocultar la contraseña
  const togglePassword = document.getElementById('togglePassword')
  const passwordInput = document.getElementById('contrasena')

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password'
    passwordInput.type = type
    togglePassword.classList.toggle('fa-eye')
    togglePassword.classList.toggle('fa-eye-slash')
  })

  // Enviar datos de login
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    // Obtener datos del formulario
    const numeroControl = document.getElementById('numeroControl').value
    const contrasena = document.getElementById('contrasena').value

    // Enviar los datos al servidor para validación
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numeroControl,
          contrasena
        })
      })

      const result = await response.json()

      if (result.success) {
        // Login exitoso
        window.location.href = '/inicio' // Redirigir al dashboard (o página principal)
      } else {
        // Mostrar mensaje de error
      }
    } catch (error) {
      console.error('Error en la solicitud de login:', error)
      // eslint-disable-next-line no-undef
      alert(error)
    }
  })
})
