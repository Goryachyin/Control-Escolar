/* eslint-disable no-unused-vars */
// Variables globales
const carrerasYMaterias = []
let materiasRegistradas = []

// Funciones de utilidad
function toggleSidebar () {
  const sidebar = document.getElementById('sidebar')
  sidebar.classList.toggle('hidden')

  // En móviles, queremos que el sidebar se superponga
  if (window.innerWidth <= 992) {
    sidebar.classList.toggle('visible')
  }
}

function mostrarConfirmModal (datos) {
  const confirmData = document.getElementById('confirmData')
  if (!confirmData) {
    console.error('Elemento confirmData no encontrado')
    return
  }

  // Generate HTML for each selected subject
  let htmlContent = ''
  datos.forEach((materia, index) => {
    htmlContent += `
      <div class="materia-confirm">
        <h4>Materia ${index + 1}: ${materia.nombre_materia}</h4>
        <p><strong>ID Materia:</strong> ${materia.id_materia}</p>
        <p><strong>ID Docente:</strong> ${materia.id_docente}</p>
        <p><strong>Aula:</strong> ${materia.aula}</p>
        <p><strong>Horario:</strong> ${materia.horarioEntrada} - ${materia.horarioSalida}</p>
        <p><strong>Días:</strong> ${materia.diasSeleccionados.join(', ')}</p>
        <p><strong>Cupo:</strong> ${materia.cupo}</p>
      </div>
      <hr>
    `
  })

  confirmData.innerHTML = htmlContent
  document.getElementById('confirmModal').style.display = 'flex'
}

function mostrarLoading (mostrar) {
  document.getElementById('loadingOverlay').style.display = mostrar ? 'flex' : 'none'
}

function mostrarError (mensaje) {
  document.getElementById('errorMessage').innerHTML = mensaje
  document.getElementById('errorModal').style.display = 'flex'
}

// eslint-disable-next-line no-unused-vars
function mostrarSuccess (mensaje) {
  document.getElementById('successMessage').innerHTML = mensaje
  document.getElementById('successModal').style.display = 'flex'
}

// eslint-disable-next-line no-unused-vars
function cerrarErrorModal () {
  document.getElementById('errorModal').style.display = 'none'
}

// eslint-disable-next-line no-unused-vars
function cerrarSuccessModal () {
  document.getElementById('successModal').style.display = 'none'
}

function cerrarConfirmModal () {
  document.getElementById('confirmModal').style.display = 'none'
}

async function buscarDocente () {
  try {
    mostrarLoading(true)
    document.getElementById('loadingOverlay').style.display = 'flex'
    // Validar datos personales
    const matricula = document.getElementById('busquedaDocente').value.trim()

    if (!matricula) {
      mostrarError('Por favor ingrese el campo requerido')
    } else {
      const response = await fetch(`/api/superuser/consultar-docente/${matricula}`)

      if (!response.ok) {
        throw new Error('No existe el docente con esa matrícula.')
      }

      const docente = await response.json()
      console.log('Datos del docente:', docente)
      document.getElementById('nombre').value = docente.nombre_persona.trim()
      document.getElementById('apellido_p').value = docente.apellido_p_persona.trim()
      document.getElementById('apellido_m').value = docente.apellido_m_persona.trim()
      document.getElementById('correo_institucional').value = docente.correo_institucional.trim()
      document.getElementById('telefono').value = docente.telefono_persona.trim()
      document.getElementById('curp').value = docente.curp_persona.trim()
      document.getElementById('horarioEntrada').value = docente.horario_entrada_docente.trim()
      document.getElementById('horarioSalida').value = docente.horario_salida_docente.trim()
      document.getElementById('datosPersonalesCard').style.display = 'block'
    }
  } catch (error) {
    mostrarError(error.message)
  } finally {
    mostrarLoading(false)
  }
}

function generarOpcionesHora (selectElement, min, max, stepMinutos = 30) {
  selectElement.innerHTML = '' // Limpiar antes
  const [minH, minM] = min.split(':').map(Number)
  const [maxH, maxM] = max.split(':').map(Number)
  const start = minH * 60 + minM
  const end = maxH * 60 + maxM

  for (let t = start; t <= end; t += stepMinutos) {
    const h = String(Math.floor(t / 60)).padStart(2, '0')
    const m = String(t % 60).padStart(2, '0')
    const option = document.createElement('option')
    option.value = `${h}:${m}`
    option.textContent = `${h}:${m}`
    selectElement.appendChild(option)
  }
}

function generarInterfazMateriasFiltradas (data) {
  const container = document.getElementById('materiasContainer')
  const horarioEntrada = document.getElementById('horarioEntrada').value
  const horarioSalida = document.getElementById('horarioSalida').value
  container.innerHTML = '' // Limpiar contenido anterior

  if (!data.length) {
    container.innerHTML = '<p>No hay materias disponibles para esta carrera y semestre.</p>'
    return
  }

  data.forEach(carrera => {
    const carreraDiv = document.createElement('div')
    carreraDiv.className = 'carrera-group'
    carreraDiv.innerHTML = `<h3>${carrera.nombre_carrera}</h3>`

    carrera.materias.forEach(materia => {
      const materiaItem = document.createElement('div')
      materiaItem.className = 'materia-item'
      materiaItem.innerHTML = `
      <div class="materia-item border rounded p-3 mb-4 bg-white shadow-sm">
        <label class="flex items-center gap-2 font-medium text-gray-800">
        <input type="checkbox" class="materia-checkbox accent-blue-600"
             data-id-materia="${materia.id_materia}"
             data-nombre-materia="${materia.nombre_materia}">
        ${materia.nombre_materia} <span class="text-sm text-gray-500">(Semestre ${materia.semestre})</span>
        </label>

        <div class="grupo-options mt-3 ml-4 border-l-4 border-blue-300 pl-4 pt-2" style="display: none;">
          <div class="mb-2">
            <label class="block mb-1 font-semibold text-gray-700">Aula:</label>
            <input type="text" class="aula-input border rounded px-2 py-1 w-full" placeholder="Ej. A-101">
          </div>

          <div class="mb-2 grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-semibold text-gray-700">Horario entrada:</label>
              <select class="select-hora-entrada" id="horarioEntrada"></select>
            </div>
            <div>
              <label class="block mb-1 font-semibold text-gray-700">Horario salida:</label>
              <select class="select-hora-salida" id="horarioSalida"></select>
            </div>
          </div>

          <div class="mb-2">
          <label class="block mb-1 font-semibold text-gray-700">Días de la semana:</label>
            <div class="dias-semana flex flex-wrap gap-4">
              ${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(dia => `
             <label class="flex items-center gap-1 text-gray-600">
              <input type="checkbox" value="${dia}" class="accent-blue-600"> ${dia}
              </label>
              `).join('')}
            </div>
          </div>

        <div class="mb-2">
          <label class="block mb-1 font-semibold text-gray-700">Cupo:</label>
          <input type="number" class="cupo-input border rounded px-2 py-1 w-24" min="1" max="50" value="30">
        </div>
        </div>
      </div>
      `

      const selectEntrada = materiaItem.querySelector('.select-hora-entrada')
      const selectSalida = materiaItem.querySelector('.select-hora-salida')

      generarOpcionesHora(selectEntrada, horarioEntrada, horarioSalida, 30) // paso de 30 minutos
      generarOpcionesHora(selectSalida, horarioEntrada, horarioSalida, 30)

      // Mostrar u ocultar los campos al marcar el checkbox
      const checkbox = materiaItem.querySelector('.materia-checkbox')
      const grupoOptions = materiaItem.querySelector('.grupo-options')
      checkbox.addEventListener('change', (e) => {
        grupoOptions.style.display = e.target.checked ? 'block' : 'none'
      })

      carreraDiv.appendChild(materiaItem)
    })

    container.appendChild(carreraDiv)
  })
}

async function cargarCarreraYMateriaPorSemestre () {
  try {
    mostrarLoading(true)
    const carreras = document.getElementById('carreras')
    const semestres = document.getElementById('semestres')

    // Cargar carreras al inicio
    try {
      const resCarreras = await fetch('/api/superuser/carreras')
      const resultResCarreras = await resCarreras.json()

      carreras.innerHTML = '<option value="">Seleccione una carrera</option>'
      resultResCarreras.forEach(carrera => {
        const option = document.createElement('option')
        option.value = carrera.id_carrera
        option.textContent = carrera.nombre_carrera
        carreras.appendChild(option)
      })
    } catch (error) {
      console.error('Error al cargar carreras:', error)
      mostrarError('Error al cargar carreras')
    }

    // Cuando se elige una carrera
    carreras.addEventListener('change', async () => {
      const idCarrera = carreras.value
      semestres.innerHTML = '<option value="">Seleccione un semestre</option>'

      if (idCarrera) {
        try {
          mostrarLoading(true)
          const resSemestres = await fetch(`/api/superuser/getMaxSemestre/${idCarrera}`)
          const resultResSemestres = await resSemestres.json()

          for (let i = 1; i <= resultResSemestres.max_semestre; i++) {
            const option = document.createElement('option')
            option.value = i
            option.textContent = `Semestre ${i}`
            semestres.appendChild(option)
          }
        } catch (error) {
          console.error('Error al cargar semestres:', error)
          mostrarError('Error al cargar semestres')
        } finally {
          mostrarLoading(false)
        }
      }
    })

    // Cuando se elige un semestre (y carrera ya está seleccionada)
    semestres.addEventListener('change', async () => {
      const idCarrera = carreras.value
      const idSemestre = semestres.value

      if (idCarrera && idSemestre) {
        try {
          mostrarLoading(true)
          const response = await fetch(`/api/superuser/carrera-materia/${idCarrera}/${idSemestre}`)
          const data = await response.json()
          console.log('Materias por semestre:', data)
          // Generar interfaz para mostrar materias
          generarInterfazMateriasFiltradas(data)
        } catch (error) {
          console.error('Error al cargar materias:', error)
          mostrarError('Error al cargar materias')
        } finally {
          mostrarLoading(false)
        }
      }
    })
  } catch (error) {
    console.error('Error general:', error)
    mostrarError('Error de conexión al cargar carreras y materias por semestre')
  } finally {
    mostrarLoading(false)
  }
}

async function materiasSeleccionadas () {
  const materiasSeleccionadas = []
  const checkBoxes = document.querySelectorAll('.materia-checkbox:checked')

  checkBoxes.forEach(checkbox => {
    const materiaItem = checkbox.closest('.materia-item')
    const aula = materiaItem.querySelector('.aula-input').value
    const horarioEntrada = materiaItem.querySelector('.select-hora-entrada').value
    const horarioSalida = materiaItem.querySelector('.select-hora-salida').value
    const diasSeleccionados = Array.from(materiaItem.querySelectorAll('input[type="checkbox"]:checked'))
      .map(dia => dia.value)
      .filter(valor => valor !== 'on')
    const cupo = parseInt(materiaItem.querySelector('.cupo-input').value)

    materiasSeleccionadas.push({
      id_materia: checkbox.dataset.idMateria,
      id_docente: document.getElementById('busquedaDocente').value,
      nombre_materia: checkbox.dataset.nombreMateria,
      aula,
      horarioEntrada,
      horarioSalida,
      diasSeleccionados,
      cupo
    })
  })

  if (materiasSeleccionadas.length === 0) {
    mostrarError('No se han seleccionado materias')
    return null
  } else {
    materiasRegistradas = materiasSeleccionadas
    mostrarConfirmModal(materiasSeleccionadas)
  }
}
// Recolectar materias asignadas
// eslint-disable-next-line no-unused-vars
function recolectarMateriasAsignadas () {
  const materiasAsignadas = []
  const periodo = document.getElementById('periodo').value

  document.querySelectorAll('.materia-checkbox:checked').forEach(checkbox => {
    const materiaItem = checkbox.closest('.materia-item')
    materiasAsignadas.push({
      id_materia: checkbox.dataset.idMateria,
      nombre_materia: checkbox.dataset.nombreMateria,
      aula: materiaItem.querySelector('.aula-input').value,
      horario: materiaItem.querySelector('.horario-input').value,
      cupo: parseInt(materiaItem.querySelector('.cupo-input').value),
      periodo
    })
  })

  return materiasAsignadas
}

async function confirmarRegistro () {
  console.log('Materias seleccionadas para registro:', materiasRegistradas)
  try {
    mostrarLoading(true)
    const response = await fetch('/api/superuser/registrar-materias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materiasRegistradas)
    })

    if (!response.ok) {
      throw new Error('Error al registrar las materias: ' + response.status)
    }

    mostrarSuccess('Materias registradas exitosamente')
  } catch (error) {
    mostrarError('Catch Error al registrar materias: ' + error.message)
  } finally {
    mostrarLoading(false)
    document.getElementById('confirmModal').style.display = 'none'
  }
}
// Event Listeners
function configurarEventListeners () {
  // Paso 1: Buscar al docente
  document.getElementById('buscarDocenteBtn').addEventListener('click', () => {
    buscarDocente()
  })

  // Paso 2: Confirmar docente
  document.getElementById('continuarBtn').addEventListener('click', () => {
    document.getElementById('asignacionMateriasCard').style.display = 'block'
    cargarCarreraYMateriaPorSemestre()
  })

  // Paso 3: Finalizar registro
  document.getElementById('finalizarBtn').addEventListener('click', () => {
    materiasSeleccionadas()
  })
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  configurarEventListeners()
})
