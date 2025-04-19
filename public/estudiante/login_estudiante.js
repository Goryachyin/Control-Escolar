document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm')
  const togglePassword = document.getElementById('togglePassword')
  const passwordInput = document.getElementById('contrasena')
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
  document.body.appendChild(modal)

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password'
    passwordInput.type = type
    togglePassword.classList.toggle('fa-eye')
    togglePassword.classList.toggle('fa-eye-slash')
  })

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const numeroControl = document.getElementById('numeroControl').value
    const contrasena = document.getElementById('contrasena').value

    try {
      const response = await fetch('/api/estudiante/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ numeroControl, contrasena })
      })

      if (response.status === 401) {
        modal.innerHTML = '<h3>Error de autenticación</h3><p>Usuario o contraseña incorrectos.</p><button id="closeModal">Cerrar</button>'
        modal.style.display = 'block'
        document.getElementById('closeModal').addEventListener('click', () => {
          modal.style.display = 'none'
        })
        return
      }

      const result = await response.json()

      if (result.success) {
        // eslint-disable-next-line no-undef
        localStorage.setItem('token', result.token)
        window.location.href = '/estudiante/inicio.html'
      } else {
        modal.innerHTML = '<h3>Error</h3><p>' + result.error + '</p><button id="closeModal">Cerrar</button>'
        modal.style.display = 'block'
        document.getElementById('closeModal').addEventListener('click', () => {
          modal.style.display = 'none'
        })
      }
    } catch (error) {
      modal.innerHTML = '<h3>Error de conexión</h3><p>Hubo un problema con el servidor.</p><button id="closeModal">Cerrar</button>'
      modal.style.display = 'block'
      document.getElementById('closeModal').addEventListener('click', () => {
        modal.style.display = 'none'
      })
    }
  })
})
