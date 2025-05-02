// Variables globales
let personaRegistrada = false
let registroCompletado = false

// Funciones de utilidad
function generarIdDocente (nss) {
  return `TEC32${nss}`
}

function generarCorreoDocente (nombre, apellidop, apellidom) {
  const primerNombre = nombre.trim().split(' ')[0].toLowerCase()
  const inicialPaterno = apellidop.trim()[0].toLowerCase()
  const inicialMaterno = apellidom.trim()[0].toLowerCase()
  return `${primerNombre}.${inicialPaterno}${inicialMaterno}@acapulco.tecnm.mx`
}

// Funciones para manejo de modales
function mostrarError (mensaje) {
  document.getElementById('mensajeError').textContent = mensaje
  document.getElementById('modalError').style.display = 'flex'
}

function cerrarModal () {
  document.getElementById('modalError').style.display = 'none'
}

function mostrarConfirmModal (datos) {
  const confirmData = document.getElementById('confirmData')
  if (!confirmData) {
    console.error('Elemento confirmData no encontrado')
    return
  }

  confirmData.innerHTML = `
    <p><strong>Nombre:</strong> ${datos.nombre} ${datos.apellido_p} ${datos.apellido_m}</p>
    <p><strong>CURP:</strong> ${datos.curp}</p>
    <p><strong>NSS:</strong> ${datos.nss}</p>
    <p><strong>ID Docente:</strong> ${datos.id_docente}</p>
    <p><strong>Correo:</strong> ${datos.correo}</p>
    <p><strong>Horario:</strong> ${datos.horarioEntrada} a ${datos.horarioSalida}</p>
  `
  document.getElementById('confirmModal').style.display = 'flex'
}

function cerrarConfirmModal () {
  document.getElementById('confirmModal').style.display = 'none'
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
    document.getElementById('datosDocenteCard').style.display = 'block'

    const correo = generarCorreoDocente(
      datosPersonales.nombre,
      datosPersonales.apellido_p,
      datosPersonales.apellido_m
    )

    document.getElementById('correo').value = correo
    document.getElementById('id_docente').value = generarIdDocente(datosPersonales.nss)

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
    const datosDocente = {
      id_docente: document.getElementById('id_docente').value,
      correo: document.getElementById('correo').value,
      horarioEntrada: document.getElementById('horario_entrada').value,
      horarioSalida: document.getElementById('horario_salida').value,
      id_persona: personaRegistrada
    }

    const response = await fetch('/api/superuser/registrar-docente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosDocente)
    })

    if (response.ok) {
      registroCompletado = true
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.location.href = '/index'
    } else {
      const errorData = await response.json()
      mostrarError(errorData.error || 'Error al registrar el docente')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarError('Error de conexión')
  } finally {
    overlay.style.display = 'none'
  }
}

function handleBeforeUnload (event) {
  if (personaRegistrada && !registroCompletado) {
    event.preventDefault()
    event.returnValue = '¡Los cambios no guardados se perderán!'
    return '¡Los cambios no guardados se perderán!'
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
  })

  document.getElementById('continuarBtn').addEventListener('click', async () => {
    await registrarDatosPersonales()
  })

  document.getElementById('finalizarBtn').addEventListener('click', (e) => {
    e.preventDefault()
    mostrarConfirmModal({
      nombre: document.getElementById('nombre').value,
      apellido_p: document.getElementById('apellido_p').value,
      apellido_m: document.getElementById('apellido_m').value,
      curp: document.getElementById('curp').value,
      nss: document.getElementById('nss').value,
      id_docente: document.getElementById('id_docente').value,
      correo: document.getElementById('correo').value,
      horarioEntrada: document.getElementById('horario_entrada').value,
      horarioSalida: document.getElementById('horario_salida').value
    })
  })
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  inicializarValidaciones()
  configurarEventListeners()
})
