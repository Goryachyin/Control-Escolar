/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const token = localStorage.getItem('token')
function toggleSidebar () {
  const sidebar = document.getElementById('sidebar')
  sidebar.classList.toggle('hidden')

  // En móviles, queremos que el sidebar se superponga
  if (window.innerWidth <= 992) {
    sidebar.classList.toggle('visible')
  }
}

function cerrarSesion () {
  // Lógica para cerrar sesión
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('token')
    window.location.href = '/login.html'
  }
}

// Funciones para los paneles desplegables
function togglePanel (panelId) {
  const panel = document.getElementById(panelId)
  panel.classList.toggle('show')
}

function editPanel (panelId, event) {
  event.stopPropagation() // Evita que se cierre el panel al hacer clic en el botón

  const panel = document.getElementById(panelId)
  const editBtn = panel.closest('.collapsible-panel').querySelector('.edit-btn')
  const saveBtn = panel.closest('.collapsible-panel').querySelector('.save-btn')

  // Cambiar botones
  editBtn.style.display = 'none'
  saveBtn.style.display = 'block'

  // Hacer editables los campos
  const fields = panel.querySelectorAll('.info-value')
  fields.forEach(field => {
    const originalValue = field.textContent
    const fieldName = field.getAttribute('data-field')
    field.innerHTML = `<input type="text" class="edit-input" value="${originalValue}" data-field="${fieldName}">`
  })
}

function savePanel (panelId, event) {
  event.stopPropagation() // Evita que se cierre el panel al hacer clic en el botón

  const panel = document.getElementById(panelId)
  const editBtn = panel.closest('.collapsible-panel').querySelector('.edit-btn')
  const saveBtn = panel.closest('.collapsible-panel').querySelector('.save-btn')

  // Cambiar botones
  editBtn.style.display = 'block'
  saveBtn.style.display = 'none'

  // Guardar valores y volver a modo visualización
  const fields = panel.querySelectorAll('.edit-input')
  fields.forEach(input => {
    const fieldName = input.getAttribute('data-field')
    const fieldValue = input.value
    const fieldElement = panel.querySelector(`.info-value[data-field="${fieldName}"]`)
    fieldElement.textContent = fieldValue
  })

  // Aquí podrías agregar código para guardar los cambios en el servidor
  alert('Cambios guardados correctamente')
}
async function uploadProfilePhoto () {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg, image/png'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          // eslint-disable-next-line quote-props
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        alert('Foto de perfil cargada correctamente')
        console.log(data.fotoURL)
        document.getElementById('profile-pic').src = data.fotoURL // Cambia la fuente de la imagen
        document.getElementById('profile-pic-welcome').src = data.fotoURL // Cambia la fuente de la imagen
      } else {
        alert(`Error al subir la foto de perfil: ${data.message}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al subir la foto de perfil')
    }
  }
  input.click()
}

document.addEventListener('DOMContentLoaded', async () => {
  // eslint-disable-next-line no-undef
  // Toggle user menu

  document.getElementById('userProfile').addEventListener('click', async (e) => {
    e.stopPropagation()
    document.getElementById('userMenu').classList.toggle('show')
  })

  // Close user menu when clicking outside
  document.addEventListener('click', async () => {
    document.getElementById('userMenu').classList.remove('show')
  })

  // Prevent menu from closing when clicking inside
  document.getElementById('userMenu').addEventListener('click', async (e) => {
    e.stopPropagation()
  })

  // Password change modal
  document.getElementById('changePasswordBtn').addEventListener('click', async (e) => {
    e.preventDefault()
    document.getElementById('userMenu').classList.remove('show')
    document.getElementById('passwordModal').classList.add('show')
  })

  document.getElementById('cancelPasswordBtn').addEventListener('click', async () => {
    document.getElementById('passwordModal').classList.remove('show')
  })

  // Close modal when clicking outside
  document.getElementById('passwordModal').addEventListener('click', async (e) => {
    if (e.target === this) {
      this.classList.remove('show')
    }
  })

  // Cerrar sidebar al hacer clic fuera en móviles
  document.addEventListener('click', async (event) => {
    const sidebar = document.getElementById('sidebar')
    const toggleBtn = document.querySelector('.toggle-btn')

    if (window.innerWidth <= 992 &&
    !sidebar.contains(event.target) &&
    !toggleBtn.contains(event.target) &&
    sidebar.classList.contains('visible')) {
      sidebar.classList.remove('visible')
    }
  })
  document.getElementById('personalInfoPanel').classList.add('show')
  console.log('Inicio de sesión (inicio, linea 125)')
  // --------
  if (!token) {
    window.location.href = '/estudiante/login'// Redirigir al login si no hay token
    console.log('No hay token (inicio, linea 128)')
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
      document.getElementById('titulo-bienvenida').textContent = 'Bienvenido, ' + data.nombre_persona
      document.getElementById('nombre').textContent = data.nombre_persona + ' ' + data.apellido_p_persona + ' ' + data.apellido_m_persona
      document.getElementById('nombre_infoPanel').textContent = data.nombre_persona + ' ' + data.apellido_p_persona + ' ' + data.apellido_m_persona
      document.getElementById('subtitulo-bienvenida').textContent = 'Número de control: ' + data.numero_control
      document.getElementById('carrera').textContent = data.nombre_carrera.toUpperCase()
      document.getElementById('correo').textContent = data.correo_institucional
      document.getElementById('semestre').textContent = data.semestre_estudiante
      document.getElementById('profile-pic').src = data.foto_perfil
      document.getElementById('profile-pic-welcome').src = data.foto_perfil
    })
    .catch(error => {
      console.error('Error al obtener datos del usuario (inicio, linea 51):', error)
    })
})
