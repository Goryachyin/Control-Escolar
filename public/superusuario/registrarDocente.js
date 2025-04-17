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
    curp.value = curp.value.toUpperCase().replace(curpRegex, '') // Opcional: poner en mayúsculas automáticamente
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
})
