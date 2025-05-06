/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
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
    window.location.href = 'login.html'
  }
}

function toggleUserMenu () {
  // Aquí podrías implementar un menú desplegable del perfil
  console.log('Mostrar menú de usuario')
}

// Cerrar sidebar al hacer clic fuera en móviles
document.addEventListener('click', function (event) {
  const sidebar = document.getElementById('sidebar')
  const toggleBtn = document.querySelector('.toggle-btn')

  if (window.innerWidth <= 992 &&
          !sidebar.contains(event.target) &&
          !toggleBtn.contains(event.target) &&
          sidebar.classList.contains('visible')) {
    sidebar.classList.remove('visible')
  }
})

// Mostrar modal con detalles del curso
function showCourseDetails (name, room, time, day, area, teacher) {
  const modal = document.getElementById('courseModal')
  document.getElementById('modalCourseTitle').textContent = name
  document.getElementById('modalCourseName').textContent = name
  document.getElementById('modalCourseRoom').textContent = room
  document.getElementById('modalCourseTime').textContent = time
  document.getElementById('modalCourseDay').textContent = day
  document.getElementById('modalCourseArea').textContent = area
  document.getElementById('modalCourseTeacher').textContent = teacher

  modal.style.display = 'flex'
}

// Cerrar modal
function closeModal () {
  document.getElementById('courseModal').style.display = 'none'
}

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener('click', function (event) {
  const modal = document.getElementById('courseModal')
  if (event.target === modal) {
    closeModal()
  }
})

// Ajustar tabla para móviles
function adjustForMobile () {
  const scheduleTable = document.querySelector('.schedule-table')
  const isMobile = window.innerWidth <= 768

  if (isMobile) {
    // Asegurar que la tabla sea desplazable horizontalmente
    if (!document.querySelector('.table-responsive')) {
      const tableWrapper = document.createElement('div')
      tableWrapper.className = 'table-responsive'
      scheduleTable.parentNode.insertBefore(tableWrapper, scheduleTable)
      tableWrapper.appendChild(scheduleTable)
    }

    // Ajustar altura de celdas basado en contenido
    document.querySelectorAll('.class-block').forEach(block => {
      block.style.minHeight = 'auto'
      block.style.height = '100%'
    })
  }
}

// Ejecutar al cargar y al cambiar tamaño
window.addEventListener('load', adjustForMobile)
window.addEventListener('resize', adjustForMobile)
