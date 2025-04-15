/* eslint-disable no-undef */
let personaRegistrada = null // Variable para almacenar el ID de la persona registrada
let registroCompletado = false // Variable para verificar si el registro se completó

// Función modificada para beforeunload
function handleBeforeUnload (event) {
  if (personaRegistrada && !registroCompletado) {
    event.preventDefault()
    const message = '¡Los cambios no guardados se perderán!'
    event.returnValue = message
    return message
  }
}

document.getElementById('continuarBtn').addEventListener('click', async function () {
  const datosPersonales = {
    nombre: document.getElementById('nombre').value,
    apellido_p: document.getElementById('apellido_p').value,
    apellido_m: document.getElementById('apellido_m').value,
    telefono: document.getElementById('telefono').value,
    curp: document.getElementById('curp').value,
    nss: document.getElementById('nss').value,
    sexo: document.getElementById('sexo').value
  }
  console.log('Datos enviados al backend:', datosPersonales) // Verifica los datos en la consola

  try {
    const response = await fetch('/api/superuser/registrar-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPersonales)
    })

    const result = await response.json()

    if (response.ok) {
      alert('Los datos fueron registrados correctamente. Si abandonas la página, los cambios se perderán. ' + result.idPersona)
      personaRegistrada = result.idPersona // Almacenar el ID de la persona registrada
      document.getElementById('datosPersonales').disabled = true // Deshabilitar la sección de datos personales
      document.getElementById('datosEstudiante').disabled = false // Habilitar la sección de datos del estudiante
      document.getElementById('numero_control').disabled = true // Deshabilitar el campo de número de control
      document.getElementById('correo').disabled = true // Deshabilitar el campo de correo institucional
      // Solicitar el último número de control y habilitar la siguiente sección
      const numeroControlResponse = await fetch('/api/superuser/ultimo-numero-control')
      const numeroControlResult = await numeroControlResponse.json()

      if (numeroControlResponse.ok) {
        const nuevoNumeroControl = numeroControlResult.nuevoNumeroControl // Obtener el nuevo número de control
        console.log('Nuevo número de control:', nuevoNumeroControl) // Verifica el nuevo número de control en la consola
        document.getElementById('numero_control').value = nuevoNumeroControl // Asigna el número de control al campo
        document.getElementById('correo').value = 'L' + nuevoNumeroControl + '@acapulco.tecnm.mx'// Limpiar el campo de correo institucional
      } else {
        alert('Error al obtener el último número de control')
      }
    } else {
      alert(result.error)
    }
  } catch (error) {
    console.error('Error al enviar los datos:', error)
    alert('Error al registrar los datos. Intenta nuevamente.')
  }
})

document.getElementById('finalizarBtn').addEventListener('click', async function (e) {
  e.preventDefault() // Prevenir el comportamiento por defecto del botón
  const datosEstudiante = {
    numero_control: document.getElementById('numero_control').value,
    correo_institucional: document.getElementById('correo').value, // Cambié 'correo_institucional' a 'correo' para que coincida con el id del campo HTML
    semestre_estudiante: document.getElementById('semestre').value, // Cambié 'semestre_estudiante' a 'semestre' para que coincida con el id del campo HTML
    estatus_estudiante: document.getElementById('estatus').value, // Cambié 'estatus_estudiante' a 'estatus' para que coincida con el id del campo HTML
    contrasena_estudiante: document.getElementById('contrasena').value, // Cambié 'contrasena_estudiante' a 'contrasena' para que coincida con el id del campo HTML
    id_persona: personaRegistrada, // Usar el ID de la persona registrada
    id_carrera: document.getElementById('id_carrera').value,
    id_documento: document.getElementById('id_documento').value,
    id_pago: document.getElementById('id_pago').value
  }
  console.log('Datos enviados al backend:', datosEstudiante) // Verifica los datos en la consola

  try {
    const response = await fetch('/api/superuser/registrar-estudiante', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosEstudiante)
    })

    if (response.ok) {
      registroCompletado = true // Marca el registro como completado
      window.removeEventListener('beforeunload', handleBeforeUnload)

      // Redirección limpia sin beforeunload
      window.location.href = '/index'
    } else {
      alert('Error al registrar el estudiante')
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Error de conexión')
  }
})
