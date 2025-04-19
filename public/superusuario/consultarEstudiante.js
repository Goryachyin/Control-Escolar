// Función para consultar estudiante
async function consultarEstudiante (matricula) {
  try {
    document.getElementById('loadingOverlay').style.display = 'flex' // Muestra el spinner de carga
    const response = await fetch(`/api/superuser/consultar-estudiante/${matricula}`)

    if (!response.ok) {
      throw new Error('No existe el estudiante con esa matrícula.')
    }

    const estudiante = await response.json()
    console.log('Datos del estudiante:', estudiante)
    mostrarEstudiante(estudiante)
    document.getElementById('resultadosCard').style.display = 'block'
  } catch (error) {
    mostrarError(error.message)
    document.getElementById('resultadosCard').style.display = 'none'
  } finally {
    document.getElementById('loadingOverlay').style.display = 'none'
  }
}

// Función para mostrar los datos del estudiante
function mostrarEstudiante (estudiante) {
  document.getElementById('nombre').value = estudiante.nombre_persona.trim()
  document.getElementById('apellido_p').value = estudiante.apellido_p_persona.trim()
  document.getElementById('apellido_m').value = estudiante.apellido_m_persona.trim()
  document.getElementById('correo').value = estudiante.correo_institucional.trim()
  document.getElementById('telefono').value = estudiante.telefono_persona.trim()
  document.getElementById('CURP').value = estudiante.curp_persona.trim()
  document.getElementById('carrera').value = estudiante.nombre_carrera.trim()
  document.getElementById('semestre').value = estudiante.semestre_estudiante
  document.getElementById('estado').value = estudiante.estatus_estudiante
}

// Función para mostrar un mensaje de error
function mostrarError (mensaje) {
  document.getElementById('mensajeError').textContent = mensaje
  document.getElementById('modalError').style.display = 'flex'

  // Limpia los campos si hubo un error
  document.getElementById('nombre').value = ''
  document.getElementById('apellido_p').value = ''
  document.getElementById('apellido_m').value = ''
  document.getElementById('correo').value = ''
  document.getElementById('telefono').value = ''
  document.getElementById('CURP').value = ''
  document.getElementById('carrera').value = ''
  document.getElementById('semestre').value = ''
  document.getElementById('estado').value = ''
}

function cerrarModal () {
  document.getElementById('modalError').style.display = 'none'
}

// Permite cerrar al hacer clic fuera del contenido del modal
window.onclick = function (event) {
  const modal = document.getElementById('modalError')
  if (event.target === modal) {
    cerrarModal()
  }
}

// Evento cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('consultaForm')
  const inputMatricula = document.getElementById('numero_control')

  form.addEventListener('submit', async function (e) {
    e.preventDefault() // Evita que se recargue la página

    const matricula = inputMatricula.value.trim()
    console.log('Consultando estudiante con matrícula:', matricula)

    if (matricula) {
      await consultarEstudiante(matricula)
    } else {
      mostrarError('Por favor, ingresa una matrícula válida.')
    }
  })
})
