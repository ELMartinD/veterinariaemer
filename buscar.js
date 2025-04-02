// Función para mostrar los resultados de búsqueda
async function buscarPublicaciones(query) {
    const resultadosContainer = document.getElementById('searchResults');
    
    // Mostrar el contenedor de resultados si hay algo en el input
    if (query.length > 0) {
        resultadosContainer.style.display = 'block';  // Mostrar los resultados
    } else {
        resultadosContainer.style.display = 'none';   // Ocultar los resultados si no hay texto
        return; // Si no hay texto, no hacer la búsqueda
    }

    try {
        const response = await fetch(`http://localhost:3000/buscar_publicaciones?query=${query}`);
        const publicaciones = await response.json();

        resultadosContainer.innerHTML = '';  // Limpiar resultados previos

        if (publicaciones.length === 0) {
            resultadosContainer.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        // Mostrar las publicaciones encontradas
        publicaciones.forEach(publicacion => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');
            resultItem.innerHTML = `
                <div class="producto-detalle1">
                    <div class="imagen-container1">
                        <img class="img-auto1" src="/uploads/${publicacion.imagen || 'default.jpg'}" alt="${publicacion.nombre}">
                    </div>
                    <div class="producto-info1">
                        <h3>${publicacion.nombre}</h3>
                        <p>${publicacion.descripcion}</p>
                    </div>
                </div>
            `;
            resultItem.onclick = () => {
                window.location.href = `/productos/${publicacion.id}.html`; // Redirigir al producto
            };
            resultadosContainer.appendChild(resultItem);
        });
    } catch (error) {
        console.error('Error al cargar los resultados:', error);
    }
}

// Escuchar el evento de la barra de búsqueda
document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value;
    buscarPublicaciones(query);  // Realizar la búsqueda y mostrar resultados
});

// Cerrar resultados al hacer clic fuera de ellos
document.addEventListener('click', function (event) {
    const resultadosContainer = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    
    // Si el clic no es en el contenedor de resultados ni en la barra de búsqueda, lo cerramos
    if (!resultadosContainer.contains(event.target) && event.target !== searchInput) {
        resultadosContainer.style.display = 'none';  // Ocultar el contenedor de resultados
    }
});

