/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const docenteGuardado = localStorage.getItem('docente')
function cerrarSesion () {
  // Lógica para cerrar sesión
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('token')
    localStorage.removeItem('docente')
    window.location.href = '/login'
  }
}

function toggleSidebar () {
  const sidebar = document.getElementById('sidebar')
  sidebar.classList.toggle('hidden')

  // En móviles, queremos que el sidebar se superponga
  if (window.innerWidth <= 992) {
    sidebar.classList.toggle('visible')
  }
}

function token () {
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/login'// Redirigir al login si no hay token
    console.log('No hay token (general, linea 62)')
  }
  if (docenteGuardado) {
    const docente = JSON.parse(docenteGuardado)
    console.log('Datos del docente (LINEA 66 EN GENERAL.JS):', docente)
  } else {
    fetch('/api/docentes/datos-usuario', {
      method: 'GET',
      headers: {
      // eslint-disable-next-line quote-props
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Token inválido o no autorizado')
        }
        return res.json()
      })
      .then(data => {
        localStorage.setItem('docente', JSON.stringify(data))
        console.log('Datos del docente (LINEA 49 EN GENERAL.JS):', data)
      })
      .catch(error => {
        console.error('Error al obtener datos del usuario:', error)
        localStorage.removeItem('token') // Eliminar token inválido
        window.location.href = '/login'
      })
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const panelSideBar = document.getElementById('sidebar')
  const panelHeader = document.getElementById('header')
  const sidebar = `
    <div class="sidebar-section">
    <button class="sidebar-btn" data-url='inicio'>
        <i class="fas fa-home"></i>
        <span>Inicio</span>
    </button>
    </div>

    <div class="sidebar-section">
    <div class="sidebar-title">Docencia</div>
    <button class="sidebar-btn" data-url='mis-grupos'>
        <i class="fas fa-calendar-alt"></i>
        <span>Mis Grupos</span>
    </button>
    <button class="sidebar-btn" data-url='calificaciones'>
        <i class="fas fa-clipboard-check"></i>
        <span>Calificaciones</span>
    </button>
    <button class="sidebar-btn" data-url='asistencias'>
        <i class="fas fa-file-alt"></i>
        <span>Asistencias</span>
    </button>
    <button class="sidebar-btn" data-url='horario'>
        <i class="fas fa-calendar-day"></i>
        <span>Horario</span>
    </button>
    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
    <button class="sidebar-btn" onclick="cerrarSesion()">
        <i class="fas fa-sign-out-alt"></i>
        <span>Cerrar Sesión</span>
    </button>
    </div>
  `
  const header = `
  <div class="school-info">
      <button class="toggle-btn" onclick="toggleSidebar()">
        <i class="fas fa-bars"></i>
      </button>
      <img
        src="https://imgs.search.brave.com/43sofZubkRq_CAr-YwObFyLRrbhkileCtqaQ1b8o8nI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/em9vbWFkcmlkLmNv/bS9jb250ZW50L2Rh/bS96b28vaW1hZ2Vz/L2FuaW1hbHMvbWFw/YWNoZS9NYXBhY2hl/LVpvby1NYWRyaWQt/bWFpbi5qcGc"
        alt="Logo Escuela" class="school-logo">
      <div>
        <span class="header-title">NYAPT EDUCATION</span>
        <span class="header-subtitle">Edición Docente</span>
      </div>
    </div>
    <div class="top-buttons">
      <button class="header-btn">
        <i class="fas fa-question-circle"></i>
        <span>Ayuda</span>
      </button>
      <button class="header-btn">
        <i class="fas fa-bell"></i>
        <span>Notificaciones</span>
      </button>
      <div class="user-profile" id="userProfile">
        <img id="profile-pic"
          alt="Foto de perfil" class="profile-image">
        <span class="username" id="nombre">Eduardo</span>

        <!-- User dropdown menu -->
        <div class="user-menu" id="userMenu">
          <div class="user-menu-header">
            <div class="user-menu-name">
              <i class="fas fa-user user-menu-icon"></i>
              <span id="nombre_dropdown"></span>
            </div>
          </div>
          <a href="#" class="user-menu-item" id="changePasswordBtn">
            <i class="fas fa-key user-menu-icon"></i>
            <span>Cambiar contraseña</span>
          </a>
          <a href="#" class="user-menu-item" onclick="uploadProfilePhoto()">
            <i class="fas fa-upload user-menu-icon"></i>
            <span>Cargar foto de perfil</span>
          </a>
          <div class="user-menu-divider"></div>
          <a href="#" class="user-menu-item" onclick="cerrarSesion()">
            <i class="fas fa-sign-out-alt user-menu-icon"></i>
            <span>Salir</span>
          </a>
        </div>
      </div>
    </div>
  `
  panelHeader.innerHTML = header
  panelSideBar.innerHTML = sidebar

  const botones = document.querySelectorAll('.sidebar-btn[data-url]')
  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      window.location.href = boton.getAttribute('data-url')
    })
    // URL
    const pageUrl = boton.getAttribute('data-url')
    if (window.location.pathname.endsWith(pageUrl)) {
      boton.classList.add('active')
    }
  })

  // Validación de token para cada pagina
  // eslint-disable-next-line no-undef
  document.getElementById('userProfile').addEventListener('click', async (e) => {
    e.stopPropagation()
    document.getElementById('userMenu').classList.toggle('show')
  })

  // Close user menu when clicking outside
  document.addEventListener('click', async () => {
    document.getElementById('userMenu').classList.remove('show')
    const sidebar = document.getElementById('sidebar')
    const toggleBtn = document.querySelector('.toggle-btn')

    if (window.innerWidth <= 992 &&
      !sidebar.contains(event.target) &&
      !toggleBtn.contains(event.target) &&
      sidebar.classList.contains('visible')) {
      sidebar.classList.remove('visible')
    }
  })

  token()
})
