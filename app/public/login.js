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

    console.log('📤 Enviando datos:', { numeroControl, contrasena })

    // Enviar los datos al servidor para validación
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numeroControl,
          contrasena
        })
      })

      console.log('🔹 Respuesta recibida:', response)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📩 Resultado de login:', result)

      if (result.success) {
        console.log('✅ Token guardado:', result.token)
        // eslint-disable-next-line no-undef
        localStorage.setItem('token', result.token)
        window.location.href = '/inicio' // Redirigir si todo está bien
      } else {
        console.error('❌ Error de login:', result.error)
      }
    } catch (error) {
      console.error('🔥 Error en la solicitud de login:', error)
    }
  })
})
