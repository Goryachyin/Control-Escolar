/* eslint-disable no-undef */
let personaRegistrada = false // Variable para verificar si la persona fue registrada
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

function generarIdDocente (nss) {
  // Generar un ID docente basado en el NSS
  const idDocente = `TEC32${nss}`
  return idDocente
}

function generarCorreoDocente (nombre, apellidop, apellidom) {
  const primerNombre = nombre.trim().split(' ')[0].toLowerCase()
  const inicialPaterno = apellidop.trim()[0].toLowerCase()
  const inicialMaterno = apellidom.trim()[0].toLowerCase()

  const correo = `${primerNombre}.${inicialPaterno}${inicialMaterno}@acapulco.tecnm.mx`
  return correo
}

document.addEventListener('DOMContentLoaded', () => {
  // Solo letras y espacios
  const soloLetras = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g
  // Solo números
  const soloNumeros = /\D/g
  // CURP (Solo letras y números)
  const curpRegex = /[^a-zA-Z0-9]/g;

  // Filtrar nombre y apellidos (letras solamente)
  ['nombre', 'apellido_p', 'apellido_m'].forEach(id => {
    const input = document.getElementById(id)
    input.addEventListener('input', () => {
      input.value = input.value.replace(soloLetras, '')
    })
  });

  // Filtrar teléfono y NSS (solo números)
  ['telefono', 'nss'].forEach(id => {
    const input = document.getElementById(id)
    input.addEventListener('input', () => {
      input.value = input.value.replace(soloNumeros, '')
    })
  })

  // Filtrar CURP (solo letras y numeros)
  const curp = document.getElementById('curp')
  curp.addEventListener('input', () => {
    curp.value = curp.value.toUpperCase().replace(curpRegex, '') // Poner en mayúsculas automáticamente
  })

  const form = document.getElementById('datosPersonales')
  const continuarBtn = document.getElementById('continuarBtn')

  const validarFormulario = () => {
    // Verifica si el formulario cumple todos los requisitos
    if (form.checkValidity()) {
      continuarBtn.disabled = false
    } else {
      continuarBtn.disabled = true
    }
  }

  // Escuchar cambios en todos los inputs y selects dentro del form
  const campos = form.querySelectorAll('input, select')
  campos.forEach(campo => {
    campo.addEventListener('input', validarFormulario)
    campo.addEventListener('change', validarFormulario)
  })

  validarFormulario() // Llama a la función al cargar la página para verificar el estado inicial del formulario

  document.getElementById('continuarBtn').addEventListener('click', async function () {
    const overlay = document.getElementById('loadingOverlay')
    overlay.style.display = 'flex' // Mostrar spinner de carga

    const datosPersonales = {
      nombre: document.getElementById('nombre').value,
      apellido_p: document.getElementById('apellido_p').value,
      apellido_m: document.getElementById('apellido_m').value,
      telefono: document.getElementById('telefono').value,
      curp: document.getElementById('curp').value,
      nss: document.getElementById('nss').value,
      sexo: document.getElementById('sexo').value
    }

    console.log('Datos enviados al backend:', datosPersonales)

    try {
      const response = await fetch('/api/superuser/registrar-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosPersonales)
      })

      const result = await response.json()

      if (!response.ok) {
        alert(`No se pudo registrar: ${result.error || 'Error desconocido'}`)
        return
      }

      // Si todo va bien:
      alert('Los datos fueron registrados correctamente. Si abandonas la página, los cambios se perderán. ' + result.idPersona)

      personaRegistrada = result.idPersona

      document.getElementById('datosPersonales').disabled = true
      document.getElementById('datosDocente').disabled = false
      document.getElementById('id_docente').disabled = true
      document.getElementById('correo').disabled = true

      const nombre = datosPersonales.nombre
      const apellidoP = datosPersonales.apellido_p
      const apellidoM = datosPersonales.apellido_m

      const correo = generarCorreoDocente(nombre, apellidoP, apellidoM)
      const idDocente = generarIdDocente(datosPersonales.nss)

      document.getElementById('correo').value = correo
      document.getElementById('id_docente').value = idDocente
    } catch (error) {
      console.error('Error al enviar los datos:', error)
      alert('Error de red o del servidor. Intenta nuevamente más tarde.')
    } finally {
      overlay.style.display = 'none' // Oculta el spinner de carga al final
    }
  })

  document.getElementById('finalizarBtn').addEventListener('click', async function (e) {
    e.preventDefault() // Prevenir el comportamiento por defecto del botón
    const nss = document.getElementById('nss').value
    const datosDocente = {
      id_docente: generarIdDocente(nss), // Generar el ID del docente
      correo: document.getElementById('correo').value,
      horarioEntrada: document.getElementById('horario_entrada').value,
      horarioSalida: document.getElementById('horario_salida').value,
      id_persona: personaRegistrada // Usar el ID de la persona registrada
    }
    console.log('Datos enviados al backend:', datosDocente) // Verifica los datos en la consola

    try {
      const response = await fetch('/api/superuser/registrar-docente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosDocente)
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
})
