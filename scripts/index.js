'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('discos')) {
    fetch('scripts/discos.json')
      .then(res => res.json())
      .then(data => localStorage.setItem('discos', JSON.stringify(data)))
      .catch(err => console.error('Error inicializando discos:', err));
  }
  mostrar();
});

function cargar(disco = null) {
  document.getElementById('formulario-carga').style.display = 'block';
  document.getElementById('form-title').textContent = disco ? 'Editar disco' : 'Cargar nuevo disco';
  const form = document.getElementById('form-disco');
  form.reset();
  form['editando-id'].value = disco ? disco.id : '';
  document.getElementById('pistas-container').innerHTML = '';
  if (disco) {
    form.nombre.value = disco.nombre;
    form.artista.value = disco.artista;
    form.portada.value = disco.portada;
    disco.pistas.forEach((p, i) => agregarPista(p.nombre, p.duracion, i));
  } else {
    agregarPista();
  }
}

function agregarPista(nombre = '', duracion = '', index = null) {
  const container = document.getElementById('pistas-container');
  index = index !== null ? index : container.children.length;
  const div = document.createElement('div');
  div.innerHTML = `
    <label>Nombre pista:
      <input type="text" name="pista-nombre-${index}" value="${nombre}" required />
    </label>
    <label>Duración (segundos):
      <input type="number" name="pista-duracion-${index}" value="${duracion}" required />
    </label>
    <button type="button" onclick="this.parentElement.remove()">Eliminar</button>
    <br>
  `;
  container.appendChild(div);
}

function cancelarCarga() {
  document.getElementById('formulario-carga').style.display = 'none';
}

document.getElementById('form-disco').addEventListener('submit', function (event) {
  event.preventDefault();

  const form = event.target;
  const id = form['editando-id'].value || Date.now();
  const nombre = form.nombre.value.trim();
  const artista = form.artista.value.trim();
  const portada = form.portada.value.trim();

  if (!nombre || !artista || !portada) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  //Custom validity

  const pistas = [];
  const pistaInputs = form.querySelectorAll('[name^="pista-nombre-"]');
  pistaInputs.forEach((input, i) => {
    const nombre = input.value.trim();
    const duracion = parseInt(form[`pista-duracion-${i}`]?.value, 10);
    if (nombre && duracion > 0) {
      pistas.push({ nombre, duracion });
    }
  });

  if (pistas.length === 0) {
    alert("Debe agregar al menos una pista válida.");
    return;
  }

  const discos = JSON.parse(localStorage.getItem('discos')) || [];
  const nuevoDisco = { id: Number(id), nombre, artista, portada, pistas };
  const index = discos.findIndex(d => d.id === Number(id));
  if (index > -1) {
    discos[index] = nuevoDisco;
  } else {
    discos.push(nuevoDisco);
  }

  localStorage.setItem('discos', JSON.stringify(discos));
  alert("Disco guardado con éxito!");
  form.reset();
  cancelarCarga();
  mostrar();
});

function mostrar() {
  const discos = JSON.parse(localStorage.getItem('discos')) || [];
  const container = document.getElementById('discos');
  container.innerHTML = '';
  discos.forEach(disco => {
    const div = document.createElement('div');
    div.classList.add("contenedor");
    div.innerHTML = `
      <h2>${disco.nombre} - ${disco.artista}</h2>
      <button onclick="DetallesMostrar(this)">Mostrar más</button>
      <button onclick='cargar(${JSON.stringify(disco)})'>Editar</button>
      <img src="${disco.portada}" width="150" />
      <ul class="detalles" style="display:none">
        ${disco.pistas.map(p => `<li>${p.nombre} - ${p.duracion}s</li>`).join('')}
      </ul>
    `;
    container.appendChild(div);
  });
}

function DetallesMostrar(btn) {
  const detalles = btn.parentElement.querySelector('.detalles');
  detalles.style.display = detalles.style.display === 'block' ? 'none' : 'block';
  btn.textContent = detalles.style.display === 'block' ? 'Ocultar' : 'Mostrar más';
}
