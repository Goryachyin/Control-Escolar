// Variables globales
let carrerasDisponibles = []
let materiasARegistrar = []

// Funciones de utilidad
function mostrarLoading (mostrar) {
  document.getElementById('loadingOverlay').style.display = mostrar ? 'flex' : 'none'
}

function mostrarSuccess (mensaje) {
  const successMessage = document.getElementById('successMessage')
  successMessage.innerHTML = formatMessage(mensaje)
  document.getElementById('successModal').style.display = 'flex'
}

function mostrarError (mensaje) {
  const errorMessage = document.getElementById('errorMessage')
  errorMessage.innerHTML = formatMessage(mensaje)
  document.getElementById('errorModal').style.display = 'flex'
}

function formatMessage (data) {
  if (typeof data === 'string') return `<p>${data}</p>`

  if (data.error || data.message) {
    let html = `<p><strong>${data.error || data.message}</strong></p>`

    if (data.detalles) {
      if (Array.isArray(data.detalles)) {
        html += '<ul>'
        data.detalles.forEach(item => {
          html += `<li>${item.message || item}</li>`
          if (item.materiaData) {
            html += `<small>Carrera: ${item.materiaData.id_carrera}, Materia: ${item.materiaData.nombre_materia}</small>`
          }
        })
        html += '</ul>'
      } else if (typeof data.detalles === 'object') {
        html += '<div>'
        for (const [key, value] of Object.entries(data.detalles)) {
          html += `<p><strong>${key}:</strong> ${value}</p>`
        }
        html += '</div>'
      } else {
        html += `<p>${data.detalles}</p>`
      }
    }

    return html
  }

  return `<pre>${JSON.stringify(data, null, 2)}</pre>`
}

function cerrarSuccessModal () {
  document.getElementById('successModal').style.display = 'none'
}

function cerrarErrorModal () {
  document.getElementById('errorModal').style.display = 'none'
}

function mostrarConfirmModal (datos) {
  const confirmData = document.getElementById('confirmData')
  confirmData.innerHTML = `
    <p><strong>Total de materias a registrar:</strong> ${datos.length}</p>
    <div class="materias-list">
      ${datos.map((materia, index) => `
        <div class="materia-item">
          <h4>Materia ${index + 1}</h4>
          <p><strong>Carrera:</strong> ${materia.nombre_carrera}</p>
          <p><strong>Nombre:</strong> ${materia.nombre_materia}</p>
          <p><strong>Semestre:</strong> ${materia.semestre}°</p>
          <p><strong>ID:</strong> ${materia.id_materia}</p>
        </div>
      `).join('')}
    </div>
  `
  document.getElementById('confirmModal').style.display = 'flex'
}

function cerrarConfirmModal () {
  document.getElementById('confirmModal').style.display = 'none'
}

// Generar formularios dinámicos
function generarFormularios (cantidad) {
  const formsContainer = document.getElementById('formsContainer')
  formsContainer.innerHTML = ''

  for (let i = 0; i < cantidad; i++) {
    const formCard = document.createElement('div')
    formCard.className = 'card materia-form'
    formCard.innerHTML = `
      <h2 class="card-title"><span>📝</span> Materia ${i + 1}</h2>
      <div class="grid-container">
        <div class="form-group">
          <label for="id_carrera_${i}">Carrera</label>
          <select id="id_carrera_${i}" name="id_carrera" required>
            <option value="">Seleccione una carrera</option>
            ${carrerasDisponibles.map(c =>
              `<option value="${c.id_carrera}">${c.nombre_carrera}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="semestre_${i}">Semestre</label>
          <select id="semestre_${i}" name="semestre" required>
            <option value="">Seleccione un semestre</option>
            ${Array.from({ length: 12 }, (_, k) =>
              `<option value="${k + 1}">${k + 1}° Semestre</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="nombre_materia_${i}">Nombre de la Materia</label>
          <input type="text" id="nombre_materia_${i}" name="nombre_materia" required>
        </div>

        <div class="form-group">
          <label for="especialidad_${i}">Especialidad (Opcional)</label>
          <input type="text" id="especialidad_${i}" name="especialidad">
        </div>

        <div class="form-group">
          <label for="creditos_${i}">Créditos</label>
          <input type="number" id="creditos_${i}" name="creditos" min="1" max="20" required>
        </div>

        <div class="form-group">
          <label for="id_materia_${i}">ID de Materia</label>
          <input type="text" id="id_materia_${i}" name="id_materia" required>
        </div>
      </div>
    `
    formsContainer.appendChild(formCard)
  }

  document.getElementById('submitContainer').style.display = 'block'
}

// Cargar carreras disponibles
async function cargarCarreras () {
  mostrarLoading(true)
  try {
    const response = await fetch('/api/superuser/carreras')
    const result = await response.json()

    if (response.ok) {
      carrerasDisponibles = result
    } else {
      mostrarError({
        error: result.error,
        detalles: result.detalles
      })
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarError({
      error: 'Error de conexión',
      detalles: 'No se pudo cargar la lista de carreras'
    })
  } finally {
    mostrarLoading(false)
  }
}

// Recolectar datos de los formularios
function recolectarDatosMaterias (cantidad) {
  const materias = []

  for (let i = 0; i < cantidad; i++) {
    const carreraSelect = document.getElementById(`id_carrera_${i}`)
    const carreraNombre = carreraSelect.options[carreraSelect.selectedIndex].text

    materias.push({
      id_carrera: document.getElementById(`id_carrera_${i}`).value,
      nombre_carrera: carreraNombre,
      semestre: document.getElementById(`semestre_${i}`).value,
      nombre_materia: document.getElementById(`nombre_materia_${i}`).value,
      especialidad: document.getElementById(`especialidad_${i}`).value || null,
      creditos: parseInt(document.getElementById(`creditos_${i}`).value),
      id_materia: document.getElementById(`id_materia_${i}`).value
    })
  }

  return materias
}

// Validar formularios
function validarFormularios (cantidad) {
  for (let i = 0; i < cantidad; i++) {
    const inputs = [
      document.getElementById(`id_carrera_${i}`),
      document.getElementById(`semestre_${i}`),
      document.getElementById(`nombre_materia_${i}`),
      document.getElementById(`creditos_${i}`),
      document.getElementById(`id_materia_${i}`)
    ]

    for (const input of inputs) {
      if (!input.value) {
        mostrarError({
          error: 'Faltan campos requeridos',
          detalles: `Por favor complete todos los campos en Materia ${i + 1}`
        })
        input.focus()
        return false
      }
    }

    if (isNaN(parseInt(document.getElementById(`creditos_${i}`).value))) {
      mostrarError({
        error: 'Datos inválidos',
        detalles: `Los créditos deben ser un número en Materia ${i + 1}`
      })
      return false
    }
  }

  return true
}

// Registrar materias en lote
async function registrarMateriasEnLote (materias) {
  mostrarLoading(true)
  try {
    const response = await fetch('/api/superuser/registrar-materias-lote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materias })
    })

    const result = await response.json()

    if (response.ok) {
      if (result.success === 'partial') {
        mostrarError({
          error: `Registro parcial: ${result.registrosExitosos} materias registradas, ${result.registrosFallidos} fallidas`,
          detalles: result.errores.map(err => ({
            message: `Materia ${err.materiaIndex + 1}: ${err.message}`,
            materiaData: materias[err.materiaIndex]
          }))
        })
        return { success: 'partial', data: result }
      }
      mostrarSuccess({
        message: `Todas las ${materias.length} materias se registraron exitosamente`,
        detalles: result.data
      })
      return { success: true, data: result }
    } else {
      mostrarError(result)
      return { success: false, error: result }
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarError({
      error: 'Error de conexión',
      detalles: 'No se pudo completar la operación'
    })
    return { success: false, error: 'Error de conexión' }
  } finally {
    mostrarLoading(false)
  }
}

// Confirmar y registrar
// eslint-disable-next-line no-unused-vars
async function confirmarRegistro () {
  cerrarConfirmModal()

  const resultado = await registrarMateriasEnLote(materiasARegistrar)

  if (resultado.success) {
    document.getElementById('formsContainer').innerHTML = ''
    document.getElementById('submitContainer').style.display = 'none'
    document.getElementById('cantidadMaterias').value = '1'
  }
}

// Event Listeners
function configurarEventListeners () {
  document.getElementById('generarFormulariosBtn').addEventListener('click', () => {
    const cantidad = parseInt(document.getElementById('cantidadMaterias').value)
    if (cantidad > 0 && cantidad <= 20) {
      generarFormularios(cantidad)
    } else {
      mostrarError({
        error: 'Cantidad inválida',
        detalles: 'Ingrese un número entre 1 y 20'
      })
    }
  })

  document.getElementById('registrarTodoBtn').addEventListener('click', async () => {
    const cantidad = parseInt(document.getElementById('cantidadMaterias').value)

    if (validarFormularios(cantidad)) {
      materiasARegistrar = recolectarDatosMaterias(cantidad)
      mostrarConfirmModal(materiasARegistrar)
    }
  })

  // Cerrar modales al hacer clic fuera
  window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('successModal')) {
      cerrarSuccessModal()
    }
    if (event.target === document.getElementById('errorModal')) {
      cerrarErrorModal()
    }
    if (event.target === document.getElementById('confirmModal')) {
      cerrarConfirmModal()
    }
  })
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  await cargarCarreras()
  configurarEventListeners()
})
