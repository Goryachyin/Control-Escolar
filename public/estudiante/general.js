document.addEventListener('DOMContentLoaded', async () => {
  const panelSideBar = document.getElementById('sidebar')
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
})
