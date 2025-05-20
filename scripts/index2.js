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
  document.getElementById('pistas-container').innerHTML = '';
  
  if (disco) {
    form.nombre.value = disco.nombre;
    form.artista.value = disco.artista;
    form.portada.value = disco.portada;
    form.codigo_disco.value = disco.codigo; // Código del disco
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
      <input type="number" name="pista-duracion-${index}" value="${duracion}" required min="0" max="7200" />
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
  const nombre = form.nombre.value.trim();
  const artista = form.artista.value.trim();
  const portada = form.portada.value.trim();
  const id = parseInt(form.codigo_disco.value.trim(), 10); // Convertimos el código a número

  if (!nombre || !artista || !portada || isNaN(id)) {
    alert("Todos los campos del formulario son obligatorios.");
    return false;
  }

  if (id < 1 || id > 999) {
    alert("El código numérico único debe estar entre 1 y 999.");
    return false;
  }

  const pistas = [];
  const pistaInputs = form.querySelectorAll('[name^="pista-nombre-"]');
  pistaInputs.forEach((input, i) => {
    const nombre = input.value.trim();
    const duracion = parseInt(form[`pista-duracion-${i}`]?.value, 10);
    if (nombre && duracion >= 0 && duracion <= 7200) {
      pistas.push({ nombre, duracion });
    }
  });

  if (pistas.length === 0) {
    alert("Tenes que agregar al menos una pista válida.");
    return false;
  }

  const discos = JSON.parse(localStorage.getItem('discos')) || [];

  // Validamos si el código ya existe en otro disco
  if (discos.some(d => d.id === id)) {
    alert("Ya existe un disco con ese código numérico. Intenta con otro código.");
    return false;
  }

  const nuevoDisco = { id, nombre, artista, portada, pistas };
  discos.push(nuevoDisco);

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
      <h2>${disco.id} - ${disco.nombre} - ${disco.artista}</h2>
      <button type="button" onclick="DetallesMostrar(this)">Mostrar más</button>
      <button type="button" onclick='cargar(${JSON.stringify(disco)})'>Editar</button>
      <img src="${disco.portada}" width="150" />
      <ul class="detalles" style="display:none">
        ${disco.pistas.map(p => {
          const minutos = Math.floor(p.duracion / 60);
          const segundos = p.duracion % 60;
          const formatoTiempo = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

          return `<li style="${p.duracion > 180 ? 'color: red; font-weight: bold;' : ''}">${p.nombre} - ${formatoTiempo}</li>`;
        }).join('')}
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
