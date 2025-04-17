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
  document.getElementById('nombre').value = estudiante.nombre_persona
  document.getElementById('apellidos').value = estudiante.apellido_p_persona + ' ' + estudiante.apellido_m_persona
  document.getElementById('correo').value = estudiante.correo_institucional
  document.getElementById('telefono').value = estudiante.telefono_persona
}
// Función para mostrar un mensaje de error
function mostrarError (mensaje) {
  document.getElementById('mensajeError').textContent = mensaje

  // Limpia los campos si hubo un error
  document.getElementById('nombre').value = ''
  document.getElementById('apellidos').value = ''
  document.getElementById('correo').value = ''
  document.getElementById('telefono').value = ''
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
