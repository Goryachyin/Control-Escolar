// Función para consultar estudiante
async function consultarEstudiante (matricula) {
  try {
    document.getElementById('loadingOverlay').style.display = 'flex' // Muestra el spinner de carga
    const response = await fetch(`/api/superuser/consultar-estudiante/${matricula}`)
    if (!response.ok) {
      throw new Error('No existe el estudiante con esa matrícula.')
    }
    const estudiante = await response.json()
    console.log('Datos del estudiante (consultarEstudiante, linea 11):', estudiante)
    mostrarEstudiante(estudiante)
  } catch (error) {
    mostrarError(error.message)
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
  document.getElementById('modalError').style.display = 'block'

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

// eslint-disable-next-line no-unused-vars
function cerrarModal () {
  document.getElementById('modalError').style.display = 'none'
}

// También permite cerrar al hacer clic fuera del contenido del modal
window.onclick = function (event) {
  const modal = document.getElementById('modalError')
  if (event.target === modal) {
    modal.style.display = 'none'
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('consultaForm')
  const inputMatricula = document.getElementById('numero_control')

  form.addEventListener('submit', async function (e) {
    e.preventDefault() // Evita que se recargue la página

    const matricula = inputMatricula.value.trim()
    console.log('Consultando estudiante con matrícula:', matricula)

    if (matricula) {
      await consultarEstudiante(matricula) // Aquí llamas a la función que consulta al backend
    } else {
      mostrarError('Por favor, ingresa una matrícula válida.')
    }
  })
})
