/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const loginForm = document.getElementById('loginForm')
  const togglePassword = document.getElementById('togglePassword')
  const passwordInput = document.getElementById('contrasena')
  const numeroControlInput = document.getElementById('numeroControl')
  let currentUserType = null // 'estudiante' o 'docente'

  // Configuración del modal de error (mejorado)
  const modal = document.createElement('div')
  modal.id = 'errorModal'
  modal.style.position = 'fixed'
  modal.style.top = '50%'
  modal.style.left = '50%'
  modal.style.transform = 'translate(-50%, -50%)'
  modal.style.background = 'white'
  modal.style.padding = '20px'
  modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)'
  modal.style.borderRadius = '10px'
  modal.style.display = 'none'
  modal.style.zIndex = '1000'
  document.body.appendChild(modal)

  // Función para mostrar el modal
  const showModal = (title, message) => {
    modal.innerHTML = `
      <h3>${title}</h3>
      <p>${message}</p>
      <button id="closeModal" style="margin-top: 15px; padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Cerrar
      </button>
    `
    modal.style.display = 'block'
    document.getElementById('closeModal').addEventListener('click', () => {
      modal.style.display = 'none'
    })
  }

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password'
    passwordInput.type = type
    togglePassword.classList.toggle('fa-eye')
    togglePassword.classList.toggle('fa-eye-slash')
  })

  // Función para establecer el tipo de usuario
  window.showLogin = (userType) => {
    currentUserType = userType
    const welcomePanel = document.getElementById('welcomePanel')
    const loginPanel = document.getElementById('loginPanel')

    welcomePanel.style.opacity = '0'
    welcomePanel.style.pointerEvents = 'none'

    // Actualizar interfaz según el tipo de usuario
    const loginTitle = document.getElementById('loginTitle')
    const loginSubtitle = document.getElementById('loginSubtitle')

    if (userType === 'estudiante') {
      loginTitle.textContent = 'Acceso Estudiantes'
      loginSubtitle.textContent = 'Ingresa tu número de control y contraseña'
      numeroControlInput.placeholder = 'Número de control'
    } else {
      loginTitle.textContent = 'Acceso Docentes'
      loginSubtitle.textContent = 'Ingresa tus credenciales institucionales'
      numeroControlInput.placeholder = 'Usuario institucional'
    }

    loginPanel.classList.add('active')
  }

  // Función para volver al panel de bienvenida
  window.hideLogin = () => {
    const welcomePanel = document.getElementById('welcomePanel')
    const loginPanel = document.getElementById('loginPanel')

    welcomePanel.style.opacity = '1'
    welcomePanel.style.pointerEvents = 'all'
    loginPanel.classList.remove('active')
    currentUserType = null
  }

  // Manejo del formulario de login
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!currentUserType) {
      showModal('Error', 'No se ha seleccionado tipo de usuario')
      return
    }

    const numeroControl = numeroControlInput.value.trim()
    const contrasena = passwordInput.value.trim()

    // Validación básica
    if (!numeroControl || !contrasena) {
      showModal('Error', 'Por favor complete todos los campos')
      return
    }

    try {
      // Endpoint diferente según el tipo de usuario
      const endpoint = currentUserType === 'estudiante'
        ? '/api/estudiante/login'
        : '/api/docente/login'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [currentUserType === 'estudiante' ? 'numeroControl' : 'usuario']: numeroControl,
          contrasena
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Credenciales incorrectas'
        showModal('Error de autenticación', errorMessage)
        return
      }

      const result = await response.json()

      if (result.success && result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('userType', currentUserType)

        // Redirección diferente según el tipo de usuario
        const redirectPath = currentUserType === 'estudiante'
          ? '/estudiante/inicio'
          : '/docentes/inicio'

        window.location.href = redirectPath
      } else {
        showModal('Error', result.error || 'Ocurrió un error durante el login')
      }
    } catch (error) {
      console.error('Error:', error)
      showModal('Error de conexión', 'Hubo un problema al conectar con el servidor')
    }
  })

  // Cerrar modal al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none'
    }

    // Ocultar panel de login si se hace clic fuera (solo cuando está activo)
    const loginPanel = document.getElementById('loginPanel')
    const floatingContainer = document.querySelector('.floating-container')

    if (loginPanel.classList.contains('active') &&
        !floatingContainer.contains(e.target)) {
      hideLogin()
    }
  })
})
