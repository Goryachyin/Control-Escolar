// Variables globales
let personaRegistrada = null
let registroCompletado = false
let datosEstudiante = {}

// Funciones de utilidad
function mostrarError (mensaje) {
  document.getElementById('mensajeError').textContent = mensaje
  document.getElementById('modalError').style.display = 'flex'
}

function cerrarModal () {
  document.getElementById('modalError').style.display = 'none'
}

function mostrarConfirmModal (datos) {
  const confirmData = document.getElementById('confirmData')
  confirmData.innerHTML = `
    <p><strong>Nombre:</strong> ${datos.nombre} ${datos.apellido_p} ${datos.apellido_m}</p>
    <p><strong>CURP:</strong> ${datos.curp}</p>
    <p><strong>NSS:</strong> ${datos.nss}</p>
    <p><strong>Número de Control:</strong> ${datos.numero_control}</p>
    <p><strong>Correo:</strong> ${datos.correo_institucional}</p>
    <p><strong>Carrera:</strong> ${document.getElementById('id_carrera').options[document.getElementById('id_carrera').selectedIndex].text}</p>
  `
  document.getElementById('confirmModal').style.display = 'flex'
}

function cerrarConfirmModal () {
  document.getElementById('confirmModal').style.display = 'none'
}

function handleBeforeUnload (event) {
  if (personaRegistrada && !registroCompletado) {
    event.preventDefault()
    event.returnValue = '¡Los cambios no guardados se perderán!'
    return '¡Los cambios no guardados se perderán!'
  }
}

// Funciones principales
async function registrarDatosPersonales () {
  const overlay = document.getElementById('loadingOverlay')
  overlay.style.display = 'flex'

  const datosPersonales = {
    nombre: document.getElementById('nombre').value,
    apellido_p: document.getElementById('apellido_p').value,
    apellido_m: document.getElementById('apellido_m').value,
    telefono: document.getElementById('telefono').value,
    curp: document.getElementById('curp').value,
    nss: document.getElementById('nss').value,
    sexo: document.getElementById('sexo').value
  }

  try {
    const response = await fetch('/api/superuser/registrar-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPersonales)
    })

    const result = await response.json()

    if (!response.ok) {
      mostrarError(`No se pudo registrar: ${result.error || 'Error desconocido'}`)
      return false
    }

    personaRegistrada = result.idPersona
    document.getElementById('datosPersonalesCard').style.display = 'none'
    document.getElementById('datosEstudianteCard').style.display = 'block'

    // Obtener número de control
    const numeroControlResponse = await fetch('/api/superuser/ultimo-numero-control')
    const numeroControlResult = await numeroControlResponse.json()

    if (numeroControlResponse.ok) {
      const nuevoNumeroControl = numeroControlResult.nuevoNumeroControl
      document.getElementById('numero_control').value = nuevoNumeroControl
      document.getElementById('correo').value = `L${nuevoNumeroControl}@acapulco.tecnm.mx`
    } else {
      mostrarError('Error al obtener el número de control')
      return false
    }

    return true
  } catch (error) {
    console.error('Error al enviar los datos:', error)
    mostrarError('Error de red o del servidor. Intenta nuevamente más tarde.')
    return false
  } finally {
    overlay.style.display = 'none'
  }
}

// eslint-disable-next-line no-unused-vars
async function confirmarRegistro () {
  const overlay = document.getElementById('loadingOverlay')
  overlay.style.display = 'flex'
  cerrarConfirmModal()

  try {
    const response = await fetch('/api/superuser/registrar-estudiante', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosEstudiante)
    })

    if (response.ok) {
      registroCompletado = true
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.location.href = '/index'
    } else {
      const errorData = await response.json()
      mostrarError(errorData.error || 'Error al registrar el estudiante')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarError('Error de conexión')
  } finally {
    overlay.style.display = 'none'
  }
}

// Inicialización
function inicializarValidaciones () {
  const soloLetras = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g
  const soloNumeros = /\D/g
  const curpRegex = /[^a-zA-Z0-9]/g;

  // Validación de campos
  ['nombre', 'apellido_p', 'apellido_m'].forEach(id => {
    const input = document.getElementById(id)
    input.addEventListener('input', () => {
      input.value = input.value.replace(soloLetras, '')
    })
  });

  ['telefono', 'nss'].forEach(id => {
    const input = document.getElementById(id)
    input.addEventListener('input', () => {
      input.value = input.value.replace(soloNumeros, '')
    })
  })

  const curp = document.getElementById('curp')
  curp.addEventListener('input', () => {
    curp.value = curp.value.toUpperCase().replace(curpRegex, '')
  })

  // Validación del formulario
  const validarFormulario = () => {
    const inputs = document.querySelectorAll('#datosPersonalesCard input[required], #datosPersonalesCard select[required]')
    const valido = Array.from(inputs).every(input => input.checkValidity())
    document.getElementById('continuarBtn').disabled = !valido
  }

  document.querySelectorAll('#datosPersonalesCard input, #datosPersonalesCard select').forEach(campo => {
    campo.addEventListener('input', validarFormulario)
    campo.addEventListener('change', validarFormulario)
  })
  validarFormulario()
}

// Event Listeners
function configurarEventListeners () {
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('modalError')) {
      cerrarModal()
    }
    if (event.target === document.getElementById('confirmModal')) {
      cerrarConfirmModal()
    }
  })

  document.getElementById('continuarBtn').addEventListener('click', async () => {
    await registrarDatosPersonales()
  })

  document.getElementById('finalizarBtn').addEventListener('click', (e) => {
    e.preventDefault()

    datosEstudiante = {
      numero_control: document.getElementById('numero_control').value,
      correo_institucional: document.getElementById('correo').value,
      semestre_estudiante: document.getElementById('semestre').value,
      estatus_estudiante: document.getElementById('estatus').value,
      contrasena_estudiante: document.getElementById('contrasena').value,
      id_persona: personaRegistrada,
      id_carrera: document.getElementById('id_carrera').value,
      id_documento: document.getElementById('id_documento').value,
      id_pago: document.getElementById('id_pago').value,
      nombre: document.getElementById('nombre').value,
      apellido_p: document.getElementById('apellido_p').value,
      apellido_m: document.getElementById('apellido_m').value,
      curp: document.getElementById('curp').value,
      nss: document.getElementById('nss').value
    }

    mostrarConfirmModal(datosEstudiante)
  })
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  inicializarValidaciones()
  configurarEventListeners()
})
