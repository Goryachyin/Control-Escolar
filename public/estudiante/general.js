/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function cerrarSesion () {
  // Lógica para cerrar sesión
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('token')
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
    <div class="sidebar-title">Académico</div>
    <button class="sidebar-btn" data-url='horario'>
        <i class="fas fa-calendar-alt"></i>
        <span>Horario</span>
    </button>
    <button class="sidebar-btn" data-url='calificaciones'>
        <i class="fas fa-clipboard-check"></i>
        <span>Calificaciones</span>
    </button>
    <button class="sidebar-btn" data-url='kardex'>
        <i class="fas fa-file-alt"></i>
        <span>Kardex</span>
    </button>
    <button class="sidebar-btn" data-url='calendario-escolar'>
        <i class="fas fa-calendar-day"></i>
        <span>Calendario</span>
    </button>
    <button class="sidebar-btn" data-url='cargamaterias'>
        <i class="fas fa-book"></i>
        <span>Carga de Materias</span>
    </button>
    <button class="sidebar-btn" data-url='actividadescomplementarias'>
        <i class="fas fa-certificate"></i>
        <span>Actividades complementarias</span>
    </button>
    </div>

    <div class="sidebar-section">
    <div class="sidebar-title">Servicios</div>
    <button class="sidebar-btn" data-url='recibos'>
        <i class="fas fa-receipt"></i>
        <span>Recibos</span>
    </button>
    <button class="sidebar-btn" data-url='pagos'>
        <i class="fas fa-credit-card"></i>
        <span>Pagos</span>
    </button>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
    <button class="sidebar-btn" data-url='contador'>
        <i class="fas fa-umbrella-beach"></i>
        <span>Vacaciones</span>
    </button>
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
        <span class="header-subtitle">Edición Estudiantil</span>
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
              <span>Eduardo Rivera Avila</span>
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
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/login'// Redirigir al login si no hay token
    console.log('No hay token (general, linea 83)')
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
      console.error('Error al verificar token (general, linea 103):', error)
      window.location.href = '/login'
    })

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
})
