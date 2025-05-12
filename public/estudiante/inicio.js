/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
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

function fechaNacimiento (curp) {
  const anio = curp.slice(4, 6)
  const mes = curp.slice(6, 8)
  const dia = curp.slice(8, 10)
  const siglo = parseInt(anio) >= 0 && parseInt(anio) <= 24 ? '20' : '19' // Ajustar según el siglo

  return `${siglo}${anio}-${mes}-${dia}` // Formato YYYY-MM-DD
}

function mostrarDatos (data) {
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
  document.getElementById('curp_infoPanel').textContent = data.curp_persona
  document.getElementById('genero_infoPanel').textContent = data.sexo_persona
  document.getElementById('fechaNacimiento_infoPanel').textContent = fechaNacimiento(data.curp_persona)
}

document.addEventListener('DOMContentLoaded', async () => {
  const estudianteGuardado = localStorage.getItem('estudiante')
  const token = localStorage.getItem('token')
  // eslint-disable-next-line no-undef
  // Toggle user menu

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
  } else {
    const estudiante = JSON.parse(estudianteGuardado)
    mostrarDatos(estudiante)
  }
  /*
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
*/
  // Obtener datos del usuario
})
