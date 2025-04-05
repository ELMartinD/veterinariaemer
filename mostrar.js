// Función para cargar los productos solo de las secciones disponibles
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:3000/productos');
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const productos = await response.json(); // Convertimos la respuesta a JSON

        // Contenedores de productos por sección
        const productosOfertas = document.getElementById('ofertas');
        const productosPerros = document.getElementById('perros');
        const productosGatos = document.getElementById('gatos');
        const productosOtros = document.getElementById('otros');

        // Secciones
        const ofertasSection = document.getElementById('ofertas-section');
        const perrosSection = document.getElementById('perros-section');
        const gatosSection = document.getElementById('gatos-section');
        const otrosSection = document.getElementById('otros-section');

        // Limpiar contenido previo en cada contenedor
        productosOfertas.innerHTML = '';
        productosPerros.innerHTML = '';
        productosGatos.innerHTML = '';
        productosOtros.innerHTML = '';

        // Inicializamos las secciones para ocultarlas
        ofertasSection.style.display = 'none';
        perrosSection.style.display = 'none';
        gatosSection.style.display = 'none';
        otrosSection.style.display = 'none';

        let hayOfertas = false;
        let hayPerros = false;
        let hayGatos = false;
        let hayOtros = false;

        // Recorremos todos los productos y los mostramos en su sección correspondiente
        productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto'); // Agregamos clase al div del producto

            // Calculamos el descuento
            const precioOriginal = parseFloat(producto.precio);
            const precioDescuento = parseFloat(producto.precio_descuento);
            const descuento = precioOriginal - precioDescuento;
            const porcentajeDescuento = (descuento / precioOriginal) * 100;

            // Rellenamos el contenido con la información de cada producto
            productoDiv.innerHTML = `
                <a class="dos" href="/productos/${producto.id}.html">
    <div class="producto-contenedor">
        <div class="oferta">${precioDescuento ? `<span class="descuento">${Math.round(porcentajeDescuento)}% OFF</span>` : ''}</div>
        <img src="uploads/${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <div class="precios">
            <p class="precio-original">${precioDescuento ? `$ ${producto.precio}` : ''}</p>
            <p class="precio-descuento">$ ${producto.precio_descuento || producto.precio}</p>
        </div>
        <p>${producto.descripcion}</p>
        <a href="/productos/${producto.id}.html" class="boton">2 cuotas sin interes</a> <!-- Redirige a la página del producto -->
    </div>
</a>
            `;

            // Determinar el contenedor adecuado según la sección
            switch (producto.seccion) {
                case 'ofertas':
                    productosOfertas.appendChild(productoDiv);
                    ofertasSection.style.display = 'block'; // Mostrar la sección si hay productos
                    hayOfertas = true;
                    break;
                case 'perros':
                    productosPerros.appendChild(productoDiv);
                    perrosSection.style.display = 'block'; // Mostrar la sección si hay productos
                    hayPerros = true;
                    break;
                case 'gatos':
                    productosGatos.appendChild(productoDiv);
                    gatosSection.style.display = 'block'; // Mostrar la sección si hay productos
                    hayGatos = true;
                    break;
                case 'otros':
                    productosOtros.appendChild(productoDiv);
                    otrosSection.style.display = 'block'; // Mostrar la sección si hay productos
                    hayOtros = true;
                    break;
                default:
                    console.log('Sección no encontrada:', producto.seccion);
            }
        });

        // Si no hay productos en una categoría, la sección se oculta automáticamente
        if (!hayOfertas) ofertasSection.style.display = 'none';
        if (!hayPerros) perrosSection.style.display = 'none';
        if (!hayGatos) gatosSection.style.display = 'none';
        if (!hayOtros) otrosSection.style.display = 'none';

    } catch (error) {
        console.error('Error al cargar los productos:', error);
        const productosContainer = document.getElementById('productos');
        productosContainer.innerHTML = '<p>Hubo un error al cargar los productos.</p>';
    }
}

// Cargar los productos cuando la página se haya cargado
window.onload = cargarProductos;

