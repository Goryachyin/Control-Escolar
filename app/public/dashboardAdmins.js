// dashboardAdmins.js

document.addEventListener("DOMContentLoaded", () => {
    const validPasswords = ["admin123", "securePass", "password2023"]; // Replace with your actual password validation logic

    // Create the popup container
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    popup.style.display = "flex";
    popup.style.flexDirection = "column";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.zIndex = "1000";

    // Create the password input field
    const input = document.createElement("input");
    input.type = "password";
    input.placeholder = "Enter Password";
    input.style.padding = "10px";
    input.style.fontSize = "16px";
    input.style.marginBottom = "10px";

    // Create the error message
    const errorMessage = document.createElement("div");
    errorMessage.textContent = "";
    errorMessage.style.color = "red";
    errorMessage.style.marginBottom = "10px";
    errorMessage.style.fontSize = "14px";

    // Create the submit button
    const button = document.createElement("button");
    button.textContent = "Submit";
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";

    // Append elements to the popup
    popup.appendChild(errorMessage);
    popup.appendChild(input);
    popup.appendChild(button);
    document.body.appendChild(popup);

    // Handle button click
    button.addEventListener("click", async () => {
        const password = input.value;

        try {
            const response = await fetch('/api/adminlogin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                password
              })
            })
      
            console.log('🔹 Respuesta recibida:', response)
      
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`)
            }
      
            const result = await response.json()
            console.log('📩 Resultado de login:', result)
      
            if (result.success) {
              console.log('✅ Token guardado:', result.token)
              // eslint-disable-next-line no-undef
              localStorage.setItem('token', result.token)
              document.body.removeChild(popup) // Redirigir si todo está bien
            } else {
              console.error('❌ Error de login:', result.error)
            }
          } catch (error) {
            console.error('🔥 Error en la solicitud de login:', error)
          }

    });

    document.getElementById("btnBuscar").addEventListener("click", async () => {
      const numero_control = document.getElementById("busqueda").value.trim();
  
      try {
          const token = localStorage.getItem("token");
          const response = await fetch("/api/buscarAlumnos", {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ numero_control })
          });
  
          if (!response.ok) {
              throw new Error(`Error al buscar estudiantes: ${response.status}`);
          }
  
          const estudiante = await response.json();
          mostrarEstudiantes(estudiante);
      } catch (error) {
          console.error("Error al buscar estudiantes:", error);
      }
  });
  
  function mostrarEstudiantes(estudiante) {
      const tablaEstudiantes = document.getElementById("tabla-estudiantes");
  
      // Create a new row
      const row = document.createElement("tr");
  
      // Insert columns with student data
      const cell1 = document.createElement("td");
      cell1.textContent = estudiante.numero_control;
      row.appendChild(cell1);
  
      const cell2 = document.createElement("td");
      cell2.textContent = estudiante.nombre;
      row.appendChild(cell2);
  
      const cell3 = document.createElement("td");
      cell3.textContent = estudiante.semestre;
      row.appendChild(cell3);
  
      // Create a cell for actions (e.g., buttons)
      const cell4 = document.createElement("td");
      // You can add any actions (e.g., delete or edit buttons) here
      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      //editButton.addEventListener("click", () => eliminarEstudiante(estudiante.numero_control));
      cell4.appendChild(editButton);
      row.appendChild(cell4);
  
      // Append the row to the table
      tablaEstudiantes.appendChild(row);
  }

    // Prevent closing the popup
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
        }
    });
});