const container = document.getElementById('table-container');

fetch('/api/students')
  .then(res => res.json())
  .then(data => {
    const { students, units } = data;

    // Header row
    const header = document.createElement('div');
    header.classList.add('table-header');
    header.innerHTML = `
      <span>Alumno</span>
      <span>Unidad: ${Array.from({ length: units }, (_, i) => `U${i + 1}`).join(' ')}</span>
    `;
    container.appendChild(header);

    // Student rows
    students.forEach(student => {
      const row = document.createElement('div');
      row.classList.add('table-row');

      const studentInfo = `
        <div class="student-info">
          <div class="avatar"></div>
          <div>
            <strong>${student.name}</strong><br>
            <small>${student.id}</small>
          </div>
        </div>
      `;

      const unitBoxes = Array.from({ length: units }, () => `<div class="box"></div>`).join('');

      const boxesDiv = `<div class="boxes">${unitBoxes}</div>`;

      row.innerHTML = studentInfo + boxesDiv;
      container.appendChild(row);
    });
  });